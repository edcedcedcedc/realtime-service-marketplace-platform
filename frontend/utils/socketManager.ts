import Toast from "react-native-toast-message";
import { TaskRequest, Task } from "../store/useStore";

type ServerMessage =
  // Socket connection lifecycle
  | { type: "socket:onopen"; payload: null }
  | { type: "socket:onclose"; payload: null }
  | { type: "socket:ondisconnect"; payload: null }

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
        action: {
          tasker: "await_client_initiate_payment";
          client: "initiate_payment_and_delete_modal";
        };
      };
    };

type MessageHandler = (payload: any) => void;

export class SocketManager {
  private socket: WebSocket | null = null;
  private listeners: Record<string, MessageHandler[]> = {};
  private url = "";
  private debugName = "default";
  private isLoggedIn = false;
  private isOnline = false; 
  private manuallyDisconnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
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
    if (!this.isOnline) return;
    this.manuallyDisconnected = false;
    this.url = url;
    this.debugName = debugName;
    this.pollingFn = pollingFn || null;
    this._connect();
  }

  private _connect() {
    if(!this.isLoggedIn || this.manuallyDisconnected || !this.isOnline) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log(`[${this.debugName}] WebSocket connected to`, this.url);
      this.reconnectAttempts = 0;
      this.pollingAttempts = 0; 
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

    if (!this.isLoggedIn) { 
      console.log(`[${this.debugName}] Skipping reconnect — user logged out`);
      return;
    }

    if (!this.isOnline) { 
      console.log(`[${this.debugName}] Skipping reconnect — network offline`);
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelayMs * this.reconnectAttempts;
      console.log(
        `[${this.debugName}] Attempting reconnect [${this.debugName}] #${this.reconnectAttempts} in ${delay}ms`,
      );
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: `Attempting reconnect #${this.reconnectAttempts} in ${delay}ms`,
          text2: "Socket manager",
        });
      }, 40);
      this.reconnectTimeoutId = setTimeout(() => this._connect(), delay);
    } else if (this.pollingFn && !this.pollingIntervalId) {
      console.log(
        `[${this.debugName}] Max reconnect attempts reached. Starting polling fallback.`,
      );
      this._startPolling();
    }
  }

  private _startPolling() {
    if (!this.pollingFn) return;
    if (this.pollingIntervalId) return;

    this.pollingAttempts = 0;
    this.pollingIntervalId = setInterval(() => {
      if (this.pollingAttempts >= this.maxPollingAttempts) {
        console.log(
          `[${this.debugName}] Max polling attempts reached. Stopping polling.`,
        );
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

  setIsOnline(state: boolean) { 
   /*  const wasOnline = this.isOnline; */
    this.isOnline = state;
/* 
    console.log(`[${this.debugName}] Network status: ${state} (was ${wasOnline})`);

    if (state && !wasOnline && !this.manuallyDisconnected) {
     
      console.log(`[${this.debugName}] Network came back online, reconnecting...`);
      this._clearReconnectTimeout();
      this.reconnectAttempts = 0;
      this._connect();
    } else if (!state && wasOnline) {
      
      console.log(`[${this.debugName}] Network offline, closing socket...`);
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    } */
  }

  disconnect(msg: string) {
    this._clearReconnectTimeout();
    this._stopPolling();
    this.socket?.close();
    this.setIsLoggedIn(false)
    this.setIsOnline(false)
    this.manuallyDisconnected = true;
    this.socket = null;
    this.listeners = {};
    this.emit("socket:onclose", `Websocket manually disconnected, ${this.debugName} ${msg}`);
    console.log(`Websocket manually disconnected, ${this.debugName} ${msg}`)
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
