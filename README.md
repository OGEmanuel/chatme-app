# ChatMe sockets, from connection to cleanup

This is a guide to how realtime connections work in this app. It starts with
the app opening, follows the connection into a chat, and finishes when the user
leaves or loses connectivity. It also explains which chat features use the
socket and which still use ordinary HTTP requests.

## The simple picture

Think of the app and server as two people communicating:

- **HTTP is a phone call you place for one specific question.** The app asks for
  messages or sends a message, the server replies, and that request is over.
- **A socket is an open walkie-talkie channel.** Once connected, either side can
  send an update whenever something happens. The channel stays open until it is
  disconnected.
- **Socket.IO is the toolkit managing that channel.** It handles connecting,
  reconnecting, and named events such as `typing.started`.

The socket does not replace the rest of the app's network requests. In this
app, chat history and sending messages use HTTP; presence, typing, and incoming
realtime notifications use the socket.

## One complete trip through the app

```text
App opens
  └─ Root layout sees the persisted logged-in state
       └─ Starts the socket lifecycle
            ├─ Gets an access token (or refreshes one)
            ├─ Connects to the Socket.IO server with that token
            └─ Waits for connection, disconnect, and auth-error events

User opens a chat
  ├─ HTTP creates/loads the conversation and gives the app its ID
  ├─ Screen retains that conversation for presence updates
  ├─ Screen listens for message and receipt events
  └─ Once connected, the app subscribes to presence for that conversation

While chatting
  ├─ Typing starts/stops are socket commands
  ├─ Sending a message is an HTTP request
  └─ The server can broadcast message.created and receipt events over the socket

App backgrounds, loses network, logs out, or unmounts
  └─ Disconnects or reconnects as appropriate, clears stale realtime state,
     removes listeners, and releases conversation subscriptions
```

## 1. Where the connection begins

The app-wide entry point is [`app/_layout.tsx`](./app/_layout.tsx). It watches
`isLoggedIn` in the auth store. When the user is logged in, an effect calls
`startSocketLifecycle()`. When the user logs out or the layout effect is
cleaned up, the lifecycle cleanup runs.

The auth store is in
[`screens/auth/store/auth-store.ts`](./screens/auth/store/auth-store.ts):

- Login puts the access token and refresh token in Zustand state.
- SecureStore persistence saves the **refresh token**, login state, and
  onboarding state.
- The access token is not persisted. On a fresh app start, the socket setup
  therefore uses the in-memory access token if available, or asks the HTTP
  auth client for a fresh one.

The token refresh helper is `getFreshAccessToken()` in
[`lib/https/index.ts`](./lib/https/index.ts). It sends the stored refresh token
to `/auth/refresh`, stores the returned tokens, and shares one in-flight refresh
request if multiple callers need a token at the same time.

## 2. What the socket object is

[`screens/chat/lib/sockets/index.ts`](./screens/chat/lib/sockets/index.ts)
creates one shared Socket.IO client:

- `autoConnect: false` means creating the object does **not** connect it yet.
  The lifecycle decides when to connect.
- `transports: ['websocket']` means this client asks to use WebSocket transport
  only; it does not fall back to long polling.
- Reconnection is enabled, with delays that grow up to a maximum.
- `connectSocket(accessToken)` puts the access token in the connection
  authorization header and starts connecting if the socket is not already
  connected.
- `disconnectSocket()` closes the active connection.

The shared object matters: the lifecycle, chat screen, and event handlers all
need to talk through the same socket. Creating a new socket in every component
would create duplicate connections and make listener cleanup unreliable.

The server URL comes from `EXPO_PUBLIC_SOCKET_URL`. HTTP requests use the
separate `EXPO_PUBLIC_API_URL`. Both need to point at the correct environment
(development, staging, or production).

## 3. How the connection is opened and kept alive

[`screens/chat/lib/sockets/lifecycle.ts`](./screens/chat/lib/sockets/lifecycle.ts)
owns the app-wide connection lifecycle. When started, it:

1. Registers handlers for `connect`, `disconnect`, and `connect_error`.
2. Registers the app-wide realtime handlers described below.
3. Watches the native app state and network connectivity.
4. Calls `open()` to start the first connection.

`open()` checks that the socket URL exists, gets an access token, and calls
`connectSocket()`. If a token is already in memory it uses that; otherwise it
refreshes first. It also shares an `opening` promise so overlapping triggers
don't all start separate token-fetch/connect attempts.

There are three particularly important connection events:

- **`connect`**: marks the socket as connected and resets the authentication
  retry counter.
- **`disconnect`**: marks it disconnected. If the server itself disconnected
  the client (`io server disconnect`), the app forces a token refresh and tries
  to reconnect.
- **`connect_error`**: reports a connection failure. If the server identifies
  the access token as invalid (`AUTH_ACCESS_TOKEN_INVALID`), the app refreshes
  the token and retries. The lifecycle caps these auth retries at three before
  disconnecting.

The app also responds to its environment:

- When the app goes to the **background**, it disconnects the socket. Mobile
  operating systems can suspend background networking, so keeping a connection
  alive there is not dependable.
- When the app returns to the **foreground**, it tries to reopen the socket if
  it is not connected.
- When network connectivity returns, it tries to open the socket if it is not
  active.
- Socket.IO's own reconnection setting handles ordinary transport interruptions.

`socket.active` means Socket.IO considers the socket active or trying to
connect; `socket.connected` means the server connection is currently
established. That distinction is why lifecycle checks use both.

## 4. What happens when a chat screen opens

[`screens/chat/index.tsx`](./screens/chat/index.tsx) first obtains a
conversation from the HTTP API. The response includes the conversation ID.
Until that ID exists, the socket hooks receive an empty string and do not
subscribe to a conversation.

With an ID, the screen sets up three hooks:

1. [`use-conversation-realtime.ts`](./screens/chat/lib/sockets/use-conversation-realtime.ts)
   calls `retainConversation(id)`. This tells the shared realtime manager that
   this screen needs presence/typing updates for that conversation.
2. [`use-message-sync.ts`](./screens/chat/lib/sockets/use-message-sync.ts)
   attaches listeners for `message.created`, `receipt.delivered`, and
   `receipt.read`. It removes those exact listeners when the screen changes
   conversation or unmounts.
3. [`use-type-emitter.ts`](./screens/chat/lib/sockets/use-type-emitter.ts)
   turns text-input activity into typing commands.

The `retainConversation` function in
[`realtime.ts`](./screens/chat/lib/sockets/realtime.ts) uses a reference count.
The first screen retaining a conversation subscribes to it if the socket is
already connected. Additional retainers share that subscription. When a screen
releases it, the count decreases; the server is unsubscribed only when the last
screen releases it.

This is similar to checking out a shared resource: one screen leaving should
not cancel a subscription another screen still needs.

If the socket is not connected yet, the conversation is still recorded as
retained. When the socket connects, the realtime manager subscribes all retained
conversations. This also happens after reconnect, because a server generally
does not preserve the old connection's room/subscription membership.

## 5. Events: commands, acknowledgements, and broadcasts

The shared event names and payload shapes are typed in
[`types.ts`](./screens/chat/lib/sockets/types.ts).

There are two directions of communication:

### The app asks the server to do something

[`commands.ts`](./screens/chat/lib/sockets/commands.ts) sends commands such as:

- `presence.subscribe`
- `presence.unsubscribe`
- `typing.start`
- `typing.stop`

These are sent with `emitWithAck()`. An acknowledgement is like asking for a
receipt: the server returns either `{ ok: true, data: ... }` or
`{ ok: false, error: ... }`. The client waits up to five seconds. The command
helpers first check `socket.connected`; they throw if there is no active
connection.

For `presence.subscribe`, the acknowledgement includes a snapshot of current
participants and people already typing. That snapshot prevents the UI from
having to wait for the next change event to learn the current state.

### The server tells the app something changed

The server can broadcast events without the app asking at that moment:

- `presence.changed`
- `typing.started`
- `typing.stopped`
- `message.created`
- `receipt.delivered`
- `receipt.read`

The listeners in `realtime.ts` update presence and typing state in the
Zustand socket store. The screen reads those values using the hooks in
[`sockets-control-store.ts`](./screens/chat/lib/store/sockets-control-store.ts).
For example, the chat header displays `typing…` or `Online`.

Typing events include an `expiresAt` timestamp. The app starts a local timer
when it hears `typing.started`, so the typing indicator turns off even if a
`typing.stopped` event is missed. A later stop event clears that timer.
Disconnecting clears the timers and presence/typing values, because those
values may be stale while offline.

## 6. The important distinction: messages are not sent over this socket

In the current implementation, pressing Send does **not** emit a socket event.
The screen calls `MUTATIONS.sendMessage()` in
[`screens/chat/lib/queries/index.ts`](./screens/chat/lib/queries/index.ts),
which makes an HTTP `POST` to
`/conversations/{conversationId}/messages`.

The screen adds an optimistic message to the React Query cache first, so it
appears immediately. If the HTTP request fails, it removes that optimistic
message and shows an error. If it succeeds, it refreshes the message query.

The socket is still useful for messages: another client can receive a
`message.created` broadcast. The current screen's
`useMessageSync` listener invalidates the messages query when a matching
conversation event arrives, then React Query fetches the latest messages over
HTTP. In short:

```text
Send a message: HTTP POST → server saves it → HTTP response → refresh query
Receive a message: socket event → invalidate query → HTTP GET latest messages
```

The socket event is a notification that something changed; the HTTP API remains
the source used to load the message list. The event payload itself is not
directly inserted into that list by `useMessageSync`.

Receipt events are written to a React Query cache entry keyed by
`['receipts', conversationId]`. The screen invalidates that key on connection,
but a visible receipt query/UI is not currently wired in this chat screen.
Likewise, the `message.created` handler exists, but the server must actually
emit that event for other clients to see message changes promptly.

## 7. What reconnecting does—and does not—guarantee

The socket is a live delivery channel, not a durable inbox. A device can be
offline, suspended, or reconnecting while events occur. Therefore:

- On reconnect, the app re-subscribes to every conversation still retained.
- It refreshes the current conversation's messages and receipts when
  `isConnected` becomes true.
- Messages are fetched from the HTTP API, which can recover changes missed
  while offline.
- Presence and typing are temporary state; they are cleared on disconnect and
  repopulated from the next presence snapshot/events.

Do not treat “socket connected” as proof that every event was received. For
durable things such as messages, keep an API/history synchronization path.

## 8. How it ends and how listeners are cleaned up

There are two levels of cleanup:

- **Leaving a conversation:** the screen hook releases its retained
  conversation. When no screen retains it, the client asks the server to
  unsubscribe and clears that conversation's local presence/typing state.
  `useMessageSync` removes its message/receipt listeners.
- **Logging out or unmounting the app-wide lifecycle:** the cleanup returned
  by `startSocketLifecycle()` marks the lifecycle closed, removes its socket
  and native app/network listeners, disconnects, resets `isConnected`, and
  removes the global realtime listeners and typing timers.

Removing the same handler function that was registered is important. Calling
`socket.off('message.created')` without a handler can accidentally remove
listeners owned by other parts of the app.

## 9. A mental model for implementing this yourself

When building realtime features in another app, work through these questions
in order:

1. **What is durable and what is temporary?** Store durable data (like messages)
   on the server and provide an API to reload it. Use realtime events to notify
   clients quickly. Presence and typing are usually temporary.
2. **Who owns the connection?** Keep one shared socket and one app-level
   lifecycle. Screens should request subscriptions, not create their own
   connections.
3. **How is the client authenticated?** Get a valid token before connecting,
   attach it to the handshake, and define exactly what happens when the server
   rejects it or the token expires.
4. **How does a screen express interest?** Subscribe when it needs a
   conversation, release when it no longer does, and re-subscribe after a
   reconnect.
5. **How will each event change app state?** Give each event a typed payload,
   validate which conversation it belongs to, and update a single clear source
   of UI state (such as a query cache or store).
6. **What is the recovery path?** Reconnect, re-subscribe, then fetch durable
   data that could have changed while offline.
7. **Who removes listeners?** Pair every `on` with a corresponding `off` in
   cleanup. Test leaving/re-entering screens and reconnecting; duplicate
   listeners can look like duplicate server events.

The usual implementation order is: define event types, create one socket with
automatic connection disabled, add an authenticated lifecycle, add typed
command/ack helpers, add screen-level subscriptions, connect events to state,
and finally handle backgrounding, network loss, reconnect, and cleanup.

## 10. Where to look when something goes wrong

| Symptom | First place to check |
| --- | --- |
| The socket never tries to connect | `EXPO_PUBLIC_SOCKET_URL`, then `startSocketLifecycle()` and its logged URL/auth errors |
| It connects, then quickly disconnects | The lifecycle's `disconnect` and `connect_error` logs; check whether the server rejected the token |
| Presence is blank after reconnect | `registerRealtimeListeners()` should resubscribe retained conversations; inspect the `presence.subscribe` acknowledgement |
| Typing stays visible too long | Check `typing.started`'s `expiresAt`, `typing.stopped`, and the local timer in `realtime.ts` |
| A sent message does not appear | Check the HTTP POST and its response first; sending currently uses HTTP, not a socket command |
| Another device's new message does not show | Check that the server emits `message.created`, that the client receives it, and that its conversation ID matches |
| Updates happen more than once | Look for duplicate `socket.on()` registrations or cleanup that failed to remove the exact listener |

### Socket-related files

- [`app/_layout.tsx`](./app/_layout.tsx): starts and stops the app-wide socket lifecycle based on login state.
- [`screens/chat/lib/sockets/index.ts`](./screens/chat/lib/sockets/index.ts): creates and connects/disconnects the shared Socket.IO client.
- [`screens/chat/lib/sockets/lifecycle.ts`](./screens/chat/lib/sockets/lifecycle.ts): authentication, app/network events, reconnect behavior, and global cleanup.
- [`screens/chat/lib/sockets/realtime.ts`](./screens/chat/lib/sockets/realtime.ts): presence/typing event handling and conversation reference counts.
- [`screens/chat/lib/sockets/commands.ts`](./screens/chat/lib/sockets/commands.ts): client-to-server commands and acknowledgements.
- [`screens/chat/lib/sockets/types.ts`](./screens/chat/lib/sockets/types.ts): event and payload types.
- [`screens/chat/lib/sockets/use-conversation-realtime.ts`](./screens/chat/lib/sockets/use-conversation-realtime.ts): screen's conversation subscription lifetime.
- [`screens/chat/lib/sockets/use-message-sync.ts`](./screens/chat/lib/sockets/use-message-sync.ts): message and receipt event listeners.
- [`screens/chat/lib/sockets/use-type-emitter.ts`](./screens/chat/lib/sockets/use-type-emitter.ts): typing command throttling and idle stop.
- [`screens/chat/lib/store/sockets-control-store.ts`](./screens/chat/lib/store/sockets-control-store.ts): connection, presence, and typing state exposed to UI.
- [`lib/https/index.ts`](./lib/https/index.ts): REST client and access-token refresh helper used before socket connections.
