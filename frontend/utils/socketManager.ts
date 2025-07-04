import { Job } from "../store/useStore";

type ServerMessage =
  | { type: "job:new"; payload: Job }
  | { type: "job:delete"; payload: { id: number } }
  | { type: "socket:onopen"; payload: null };

type MessageHandler = (payload: any) => void;

class SocketManager {
  private socket: WebSocket | null = null;
  private listeners: Record<string, MessageHandler[]> = {};
  private url: string = "";

  connect(url: string) {
    if (this.socket) return;
    this.url = url;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket connected to", url);
      this.emit("socket:onopen", null);
    };

    this.socket.onmessage = (e) => {
      try {
        const msg: ServerMessage = JSON.parse(e.data);
        if (msg.type == "job:delete") {
          const id = Number(msg.payload.id);
          if (isNaN(id)) {
            console.log(" const id = Number(msg.payload.id); is isNaN");
          } else {
            msg.payload.id = id;
          }
        }
        this.emit(msg.type, msg.payload);
      } catch (err) {
        console.error("Failed to parse socket message", err);
      }
    };

    this.socket.onclose = () => {
      console.warn("WebSocket closed. You might want to reconnect.");
      this.socket = null;
    };

    this.socket.onerror = (e) => {
      console.error("WebSocket error", e);
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.listeners = {};
  }

  on(eventType: string, handler: MessageHandler) {
    if (!this.listeners[eventType]) this.listeners[eventType] = [];
    this.listeners[eventType].push(handler);
  }

  off(eventType: string, handler: MessageHandler) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType] = this.listeners[eventType].filter(
      (h) => h !== handler,
    );
  }

  emit(eventType: string, data: any) {
    const handlers = this.listeners[eventType] || [];
    handlers.forEach((fn) => fn(data));
  }

  send(eventType: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: eventType, payload }));
    } else {
      console.warn("Cannot send, socket not open");
    }
  }
}

export const socketManager = new SocketManager();
