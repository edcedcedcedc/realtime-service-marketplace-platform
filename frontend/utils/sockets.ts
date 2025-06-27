import { Job } from "../store/useStore";
import { WS_URL } from "../services/api";
let socket: WebSocket | null = null;

export function startSocket(onMessage: (job: Job) => void) {
  if (socket) return; // avoid reconnecting if already connected
  socket = new WebSocket(WS_URL);

  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    onMessage(data);
  };
}

export function closeSocket() {
  socket?.close();
  socket = null;
}
