import Toast from "react-native-toast-message";
import { TaskRequest, Task } from "../store/useStore";

type ServerMessage =
  // Socket connection lifecycle
  | { type: "socket:onopen"; payload: null }
  | { type: "socket:onclose"; payload: null }

  // Task feed updates (broadcasted to all taskers)
  | { type: "task:new"; payload: Task }
  | { type: "task:delete"; payload: { id: number } }

  // TaskRequest events (in task request group room)
  | { type: "taskrequests:newall"; payload: TaskRequest[] }
  | { type: "taskrequest:new"; payload: TaskRequest }
  | {
      type: "taskrequest:delete";
      payload: {
        task_request_id: number;
        task_id: number;
        tasker_id: number;
        client_id?: number;
        action?: any;
      };
    }

  // Direct notifications to taskers
  | {
      type: "taskrequest:initiate-by-tasker";
      timestamp: string;
      payload: {
        task_id: number;
        client_id: number;
        tasker_id: number;
        task_request_id: number;
        action: { tasker: string | ""; client: string | "" };
      };
    }
  | {
      type: "taskrequest:cancelled-by-client";
      timestamp: string;
      payload: {
        task_id: number;
        client_id: number;
        tasker_request_id: number;
        action: { tasker: string | ""; client: string | "" };
      };
    }
  | {
      type: "taskrequest:cancelled-by-tasker";
      timestamp?: string;
      payload: {
        task_id: number;
        client_id: number;
        tasker_id: number;
        task_request_id: number;
        action: string;
      };
    }
  | {
      type: "taskrequest:accepted-by-client";
      payload: {
        task_id: number;
        tasker_id: number;
        client_id: number;
        task_request_id: number;
        action: { tasker: string | ""; client: string | "" };
      };
    }
    | {
      type: "taskrequest:confirmed-by-tasker";
      payload: {
        task_id: number;
        tasker_id: number;
        client_id: number;
        task_request_id: number;
        action: { tasker: "await_client_initiate_payment"; 
          client: "initiate_payment_and_delete_modal" };
      };
    };


type MessageHandler = (payload: any) => void;


export class SocketManager {
  private socket: WebSocket | null = null;
  private listeners: Record<string, MessageHandler[]> = {};
  private url = "";
  private debugName = "default";
  private isLoggedIn = false;
  private manuallyDisconnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private additionalReconnectAttempts = 0;
  private maxAdditionalReconnectAttempts = 3; 
  private reconnectDelayMs = 1000;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private pollingIntervalMs = 10000;
  private pollingFn: (() => void) | null = null;

  private pollingAttempts = 0;
  private maxPollingAttempts = 3;

  connect(url: string, debugName = "default", pollingFn?: () => void) {
    if (this.socket) return;
    if(!this.isLoggedIn) return;
    this.manuallyDisconnected = false;
    this.url = url;
    this.debugName = debugName;
    this.pollingFn = pollingFn || null;
    this._connect();
  }

  private _connect() {
    if(!this.isLoggedIn || this.manuallyDisconnected) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log(`[${this.debugName}] WebSocket connected to`, this.url);
      setTimeout(()=>{
        Toast.show({
        type: "success",
        text1: "Websocket connected!",
        text2: `${this.debugName}`,
      });
      },3000)

      this.reconnectAttempts = 0;
      this.pollingAttempts = 0; // reset polling attempts on successful connection
      this._clearReconnectTimeout();
      this._stopPolling();
      this.emit("socket:onopen", null);
    };

    this.socket.onmessage = (e) => {
      try {
        const msg: ServerMessage = JSON.parse(e.data);
        if (msg.type == "task:delete") {
          const id = Number(msg.payload.id);
          if (!isNaN(id)) msg.payload.id = id;
        }
        this.emit(msg.type, msg.payload);
      } catch (err) {
        console.log(`[${this.debugName}] Failed to parse socket message`, err);
      }
    };

    this.socket.onclose = () => {
      console.log(`[${this.debugName}] WebSocket disconnected from`, this.url);
      setTimeout(()=>{
        Toast.show({
        type: "error",
        text1: "Websocket connection close!",
        text2: `Task feed, server error, ${this.debugName}`,
      });
      },)
      this.emit("socket:onclose", null);
      this._tryReconnectOrPoll();
    };

    this.socket.onerror = (e) => {
      console.log(`[${this.debugName}] WebSocket error`, e);
      // Try graceful recovery if it errors without closing
      if (this.socket?.readyState !== WebSocket.CLOSED) {
        this.socket?.close();
      }
    };
  }

  private _tryReconnectOrPoll() {
    if (this.manuallyDisconnected) {
    console.log(`[${this.debugName}] Skipping reconnect — manually disconnected`);
    return;
  }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelayMs * this.reconnectAttempts;
      console.log(`[${this.debugName}] Attempting reconnect #${this.reconnectAttempts} in ${delay}ms`);
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: `Attempting reconnect #${this.reconnectAttempts} in ${delay}ms`,
          text2: "Socket manager",
        });
      }, 100);
      this.reconnectTimeoutId = setTimeout(() => this._connect(), delay);
    } else if (this.pollingFn && !this.pollingIntervalId) {
      console.log(`[${this.debugName}] Max reconnect attempts reached. Starting polling fallback.`);
      this._startPolling();
    }
  }

  private _startPolling() {
    if (!this.pollingFn) return;
    if (this.pollingIntervalId) return;

    this.pollingAttempts = 0; // reset before starting polling
    this.pollingIntervalId = setInterval(() => {
      if (this.pollingAttempts >= this.maxPollingAttempts) {
        console.log(`[${this.debugName}] Max polling attempts reached. Stopping polling.`);
        this._stopPolling();
        return;
      }
      this.pollingAttempts++;
      this.pollingFn!();
    }, this.pollingIntervalMs);
  }

  private _stopPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  private _clearReconnectTimeout() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  setIsLoggedIn(state: boolean) {
  this.isLoggedIn = state;
  }

  disconnect(msg: string) {
    this._clearReconnectTimeout();
    this._stopPolling();
    this.socket?.close();
    this.setIsLoggedIn(false)
    this.manuallyDisconnected = true;
    this.socket = null;
    this.listeners = {};
    setTimeout(() => {
      Toast.show({
        type: "info",
        text1: `Websocket manually disconnected,${msg} !`,
        text2: `Task feed ${this.debugName}`,
      });
    }, 100);
  }

  on(event: ServerMessage["type"], handler: MessageHandler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  off(event: ServerMessage["type"], handler: MessageHandler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  emit(event: ServerMessage["type"], data: any) {
    (this.listeners[event] || []).forEach((fn) => fn(data));
  }

  send(event: ServerMessage["type"], payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: event, payload }));
    } else {
      console.warn("Cannot send, socket not open");
    }
  }
}
