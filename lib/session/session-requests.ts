const sessionControllers = new Map<number, AbortController>();

export function getSessionSignal(generation: number) {
  let controller = sessionControllers.get(generation);
  if (!controller || controller.signal.aborted) {
    controller = new AbortController();
    sessionControllers.set(generation, controller);
  }
  return controller.signal;
}

export function cancelSessionRequests(generation: number) {
  const controller = sessionControllers.get(generation);
  controller?.abort();
  sessionControllers.delete(generation);
}
