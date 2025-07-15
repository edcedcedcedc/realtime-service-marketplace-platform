import { Request, Task } from "../store/useStore";

type ServerMessage =
  | { type: "task:new"; payload: Task }
  | { type: "task:delete"; payload: { id: number } } //the task id
  | { type: "task:requests-new"; payload: Request }
  | {
      type: "task:requests-delete";
      payload: {
        task_request_id: number; //the request id within InspectRequestsModal, used in the flatlist
        task_id: number;
        tasker_id: number;
      };
    }
  | { type: "socket:onopen"; payload: null }
  | { type: "socket:onclose"; payload: null };

type MessageHandler = (payload: any) => void;

export class SocketManager {
  private socket: WebSocket | null = null;
  private listeners: Record<string, MessageHandler[]> = {};
  private url: string = "";
  private debugName: string = "default";

  connect(url: string, debugName: string = "default") {
    if (this.socket) return;
    this.url = url;
    this.socket = new WebSocket(url);
    this.debugName = debugName;

    this.socket.onopen = () => {
      console.log(`[${this.debugName}] WebSocket connected to`, url);
      this.emit("socket:onopen", null);
    };

    this.socket.onmessage = (e) => {
      try {
        const msg: ServerMessage = JSON.parse(e.data);
        if (msg.type == "task:delete") {
          const id = Number(msg.payload.id);
          if (isNaN(id)) {
            console.log(" const id = Number(msg.payload.id); is isNaN");
          } else {
            msg.payload.id = id;
          }
        }
        this.emit(msg.type, msg.payload);
      } catch (err) {
        console.error(
          `[${this.debugName}] Failed to parse socket message`,
          err,
        );
      }
    };

    this.socket.onclose = (event) => {
      console.warn("WebSocket closed at URL:", this.url);
      console.warn(`[${this.debugName}] WebSocket closed.`, event);
      this.socket = null;
    };

    this.socket.onerror = (e) => {
      console.error(`[${this.debugName}] WebSocket error`, e);
    };
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
    this.listeners = {};
  }

  on(eventType: string, handler: MessageHandler) {
    console.log(eventType, "eventType", handler, "Message Handler");
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
