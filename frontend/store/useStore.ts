import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sortTasksByDate } from "../utils/sortTasks"

export const URGENCY_OPTIONS = [
  { label: "Now", value: "now", color: "#ff3b30" },
  { label: "Soon", value: "soon", color: "#ff9500" },
  { label: "Flexible", value: "flexible", color: "#34c759" },
];

export const STATUS_OPTIONS = [
  { label: "Open", value: "open", color: "#1976d2" }, // MUI Blue 700
  { label: "Confirmed", value: "confirmed", color: "#fbc02d" }, // MUI Yellow 700
  { label: "In Progress", value: "in-progress", color: "#388e3c" }, // MUI Green 700
  { label: "Completed", value: "completed", color: "#2e7d32" }, // MUI Green 800
  { label: "Cancelled", value: "cancelled", color: "#d32f2f" }, // MUI Red 700
  { label: "Expired", value: "expired", color: "#616161" }, // MUI Grey 700
];



export const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  repair: ["electrical", "plumbing", "appliance", "furniture", "other"],
  personal_help: [
    "dog_walking",
    "grocery_pickup",
    "waiting_line",
    "elderly_help",
    "other",
  ],
  delivery: ["package_delivery", "furniture_moving", "heavy_lifting", "other"],
  other: [],
};

export const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const initialState = {
  auth: {
    jwt: { access: null, refresh: null },
    user: null,
  },
  taskers: [],
  clients: [],
  tasks: [],
  loading: false,
  tempTaskData: null,
  selectedRegion: null,
  selectedLatLng: null,
  markerPoint: null,
  miniMapReady: false,
  fullMapReady: false,
  isFullMapVisible: false,
};

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Point {
  x: number;
  y: number;
}

export const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
export interface LatLng {
  latitude: number;
  longitude: number;
}

export type TaskFormInput = {
  title: string;
  description: string;
  location: string;
  budget: number;
  urgency: string;
  category: string;
  subcategory: string;
};

type Status =
  | "open"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

export interface Task {
  id: number;
  title: string;
  description?: string;
  budget: number;
  urgency: "now" | "soon" | "flexible";
  location: string;
  latitude: number;
  longitude: number;
  status: Status;
  client_username: string;
  tasker_username: string | null;
  tasker_id: number | null;
  expires_from_feed: string | null;
  must_start_by: string | null;
  created_at: string;
  updated_at: string | null;
  category: "repair" | "delivery" | "personal_help" | "other";
  subcategory: string;
  subtasks?: [];
}
interface Jwt {
  access: string | null;
  refresh: string | null;
}
interface Loading {
  loading: boolean;
}
interface State {
  auth: {
    jwt: Jwt | null;
    user: User | null;
  };
  taskers: User[];
  clients: User[];
  tasks: Task[];
  loading: boolean;
  tempTaskData: TaskFormInput | null;
  selectedRegion: Region | null;
  selectedLatLng: LatLng | null;
  markerPoint: Point | null;
  miniMapReady: boolean;
  fullMapReady: boolean;
  isFullMapVisible: boolean;
  setMiniMapReady: (ready: boolean) => void;
  setFullMapReady: (ready: boolean) => void;
  setIsFullMapVisible: (visible: boolean) => void;
  setMarkerPoint: (point: Point | null) => void;
  setAuth: (jwt: Jwt, user: User | null) => void;
  clearAuth: () => void;
  addTasker: (tasker: User) => void;
  addClient: (client: User) => void;
  addTask: (task: Task) => void;
  removeTask: (id: number) => void;
  setTasks: (task: Task[]) => void;
  setLoading: (value: boolean) => void;
  setTempTaskData: (data: TaskFormInput | null) => void;
  setSelectedRegion: (region: Region | null) => void;
  setSelectedLatLng: (latLng: LatLng | null) => void;
  resetStore: () => void;
}

const useStore = create<State>()(
  persist(
    (set) => ({
      auth: {
        jwt: {
          access: null,
          refresh: null,
        },
        user: null,
      },
      taskers: [],
      clients: [],
      tasks: [],
      loading: false,
      tempTaskData: null,
      selectedRegion: null,
      selectedLatLng: null,
      markerPoint: null,
      miniMapReady: false,
      fullMapReady: false,
      isFullMapVisible: false,
      setMiniMapReady: (ready) => set({ miniMapReady: ready }),
      setFullMapReady: (ready) => set({ fullMapReady: ready }),
      setIsFullMapVisible: (visible) => set({ isFullMapVisible: visible }),
      setMarkerPoint: (point) => set({ markerPoint: point }),
      setSelectedRegion: (region) => {
        if (!region) {
          set({ selectedRegion: null });
          return;
        }
        let latitude = Number(region.latitude.toFixed(6));
        let longitude = Number(region.longitude.toFixed(6));
        let latitudeDelta = region.latitudeDelta;
        let longitudeDelta = region.longitudeDelta;
        set({
          selectedRegion: {
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta,
          },
        });
        set({
          selectedLatLng: {
            latitude,
            longitude,
          },
        });
      },
      setSelectedLatLng: (latLng) => set({ selectedLatLng: latLng }),
      setTempTaskData: (data) => set({ tempTaskData: data }),
      setLoading: (value: boolean) => set({ loading: value }),
      setAuth: (jwt: Jwt, user: User | null) => set({ auth: { jwt, user } }),
      clearAuth: () =>
        set((state) => ({
          auth: {
            jwt: { access: null, refresh: null },
            user: state.auth.user, // keep user info if you want
          },
        })),
      addTasker: (tasker: User) =>
        set((state) => {
          const exists = state.taskers.some((t) => t.id === tasker.id);
          if (exists) return {};
          return { taskers: [...state.taskers, tasker] };
        }),

      addClient: (client: User) =>
        set((state) => {
          const exists = state.clients.some((c) => c.id === client.id);
          if (exists) return {};
          return { clients: [...state.clients, client] };
        }),
      addTask: (task: Task) =>
        set((state) => {
          const normalizedTask = { ...task, id: Number(task.id) };
          const exists = state.tasks.some((t) => t.id === normalizedTask.id);
          if (exists) return {};
          return { tasks: sortTasksByDate([...state.tasks, normalizedTask]) };
        }),
      removeTask: (id: number) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== Number(id)),
        })),
      setTasks: (tasks: Task[]) =>
        set({
          tasks: sortTasksByDate(
            tasks.map((task) => ({ ...task, id: Number(task.id) })),
          ),
        }),
      resetStore: () => set({ ...initialState }),
    }),
    {
      name: "my-app-storage",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value: any) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);

export default useStore;
