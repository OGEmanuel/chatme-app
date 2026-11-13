import { queryClient } from '@/lib/query-client';
import { cancelSessionRequests } from '@/lib/session/session-requests';
import { usePhotoControlStore } from '@/screens/auth/store/photo-control-store';
import { useConvoControlStore } from '@/screens/chat/lib/store/convo-control-store';
import { useSocketStore } from '@/screens/chat/lib/store/sockets-control-store';

export function clearPrivateSessionState(sessionGeneration: number) {
  cancelSessionRequests(sessionGeneration);
  void queryClient
    .cancelQueries()
    .catch(error => console.warn('private query cancellation failed', error));
  queryClient.clear();
  useConvoControlStore.getState().clear();
  usePhotoControlStore.getState().clearPhotoUri();
  useSocketStore.setState({ online: {}, typing: {} });
}
