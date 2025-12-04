import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useOnlineStatus } from "../hooks/useOnlineStatus"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sortTasksByDateDesc, sortRequestsByDateDesc } from "../utils/sort";
import type { InitialState } from "@react-navigation/native";

import { COLORS } from "../constants/colors";

export const URGENCY_OPTIONS = [
  { label: "Now", value: "now", color: COLORS.color7 },
  { label: "Soon", value: "soon", color: COLORS.color8 },
  { label: "Flexible", value: "flexible", color: COLORS.color9 },
];

export const STATUS_OPTIONS = [
  { label: "Open", value: "open", color: COLORS.color1 }, // MUI Blue 700
  { label: "Accepted", value: "accepted", color: COLORS.color2 }, // MUI Blue 700
  { label: "Confirmed", value: "confirmed", color: COLORS.color3 }, // MUI Blue 700
  { label: "In Progress", value: "in-progress", color: COLORS.color4 }, // MUI Green 700
  { label: "Completed", value: "completed", color: COLORS.color5 }, // MUI Green 800
  { label: "Cancelled", value: "cancelled", color: COLORS.color6 }, // MUI Red 700
  { label: "Expired", value: "expired", color: COLORS.color7 }, // MUI Grey 700
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

const initialProfile: ProfileType = {
  user: {
    id: 0,
    username: "",
    email: "",
    role: "client",
  },
  name: "",
  family_name: "",
  rating: 0,
  bio: "",
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
  taskRequests: [],
  currentTask: null,
  isLoggedIn: false,
  profile: initialProfile,
  navigationState: undefined
};

interface Notification {
  type: string;
  timestamp: string;
  payload: any;
}
interface ProfileType {
  user: User; // must always be present
  name: string;
  family_name: string;
  rating: number;
  bio: string;

  // tasker-only fields (optional for client)
  tasks_done?: number;
  eta?: string;
  category?: Category;

  // client-only fields (optional for tasker)
  tasks_posted?: number;
}

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
  | "accepted"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";
export type Category = "repair" | "delivery" | "personal_help" | "other";
export type Specialization = Category | `other: ${string}`;
export type Urgency = "now" | "soon" | "flexible";
export interface Task {
  id: number;
  title: string;
  description?: string;
  budget: number;
  urgency: Urgency;
  location: string;
  latitude: number;
  longitude: number;
  status: Status;
  client: number | null;
  tasker: number | null;
  expires_from_feed: string | null;
  must_start_by: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  category: Category;
  subcategory: string;
  subtasks?: [];
}
/* Tasker request, when he clicks accept on any task  */
export interface TaskRequest {
  id: number;
  task_id: number;
  tasker_id: number;
  tasker_username: string;
  tasker_name: string;
  tasker_family_name: string;
  rating: number;
  tasks_done: number;
  category: string;
  eta: number;
  created_at: string;
}

interface Jwt {
  access: string | null;
  refresh: string | null;
}

interface State {
  auth: {
    jwt: Jwt | null;
    user: User | null;
  };
  profile: ProfileType;
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
  isLoggedIn: boolean;
  isOnline: boolean;
  currentTask: Task | null;
  taskRequests: TaskRequest[];
  isSearching: boolean;
  notifications: Notification[];
  appKey: number;
  navigationState: InitialState | undefined;
  refresh: number;
  isHeaderMenuVisible: boolean;
  setIsOnline: (isOnline: boolean) => void;
  setIsHeaderMenuVisible: (visible: boolean) => void;
  setRefresh: () => void;
  setNavigationState: (state: InitialState) => void;
  setAppKey: () => void;
  forceReload: () => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  addRequest: (request: TaskRequest) => void;
  clearRequest: (requestId: number) => void;
  clearRequests: () => void;
  setRequests: (taskRequests: TaskRequest[]) => void;
  setCurrentTask: (task: Task | null) => void;
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
  setIsLoggedIn: (param: boolean) => void;
  resetStore: () => void;
  setProfile: (profile: ProfileType) => void;
  resetProfile: () => void;
  setIsSearching: (param: boolean) => void;
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
      isLoggedIn: false,
      profile: initialProfile,
      currentTask: null,
      taskRequests: [],
      isSearching: false,
      notifications: [],
      appKey: 0,
      isOnline: false,
      setIsOnline: (isOnline) => set({ isOnline }),
      isHeaderMenuVisible: false,
      setIsHeaderMenuVisible: (visible) =>set({ isHeaderMenuVisible: visible }),
      setAppKey: () =>
        set((state) => {
          console.log(
            "Force app reload triggered. Current appKey:",
            state.appKey,
          );
          return { appKey: state.appKey + 1 };
        }),
      forceReload: () =>
        set((state) => ({
          appKey: state.appKey + 1,
        })),
      refresh: 0,
      setRefresh: () =>
        set((s) => {
          console.log("Force app reload triggered. Current appKey:", s.refresh);
          return { refresh: s.refresh + 1 };
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      clearNotifications: () => set({ notifications: [] }),
      setIsSearching: (param) => set({ isSearching: param }),
      setCurrentTask: (task: Task | null) => set({ currentTask: task }),
      addRequest: (request) =>
        set((state) => ({
          taskRequests: sortRequestsByDateDesc([
            ...state.taskRequests,
            request,
          ]),
        })),
      clearRequest: (request_id: number) =>
        set((state) => ({
          taskRequests: sortRequestsByDateDesc(
            state.taskRequests.filter((r) => r.id !== request_id),
          ),
        })),
      clearRequests: () => set({ taskRequests: [] }),
      setProfile: (profile: ProfileType) => set({ profile }),
      resetProfile: () => set({ profile: initialProfile }),
      setIsLoggedIn: (param) => set({ isLoggedIn: param }),
      setMiniMapReady: (ready) => set({ miniMapReady: ready }),
      setFullMapReady: (ready) => set({ fullMapReady: ready }),
      setIsFullMapVisible: (visible) => set({ isFullMapVisible: visible }),
      setMarkerPoint: (point) => set({ markerPoint: point }),
      setSelectedRegion: (region) => {
        if (!region) {
          set({ selectedRegion: null });
          return;
        }

        const latitude = Number(region.latitude.toFixed(6));
        const longitude = Number(region.longitude.toFixed(6));
        const latitudeDelta = region.latitudeDelta;
        const longitudeDelta = region.longitudeDelta;

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
            user: null,
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
          return {
            tasks: sortTasksByDateDesc([...state.tasks, normalizedTask]),
          };
        }),

      removeTask: (id: number) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== Number(id)),
        })),

      setTasks: (tasks: Task[]) =>
        set({
          tasks: sortTasksByDateDesc(
            tasks.map((task) => ({ ...task, id: Number(task.id) })),
          ),
        }),
      setRequests: (taskRequests: TaskRequest[]) =>
        set({
          taskRequests: sortRequestsByDateDesc(
            taskRequests.map((request) => ({
              ...request,
              id: Number(request.id),
            })),
          ),
        }),
      resetStore: () =>
        set({
          ...initialState,
          profile: initialProfile,
        }),
      navigationState: undefined,
      setNavigationState: (state: InitialState) =>
        set({ navigationState: state }),
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
      /*  merge: (persistedState, currentState) => {
    return {
      ...currentState,
      ...(persistedState as any),
      profile: (persistedState as any)?.profile ?? initialProfile,
    };
  }, */
    },
  ),
);

export default useStore;
