import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  currentTaskId: null,
  currentTempTaskId: null,
  isLoggedIn: false,
  profile: initialProfile,
  navigationState: undefined,
  isInitDialog: false,
  isConnected: false,
  snackbarVisible:false,
  isSearching: false,
};

interface Notification {
  type: string;
  timestamp: string;
  payload: any;
}
export interface ProfileType {
  user: User; // must always be present
  name: string;
  family_name: string;
  rating: number;
  bio: string;
  // client-only fields (optional for tasker)
  tasks_posted?: number;
  // tasker-only fields (optional for client)
  tasks_done?: number;
  eta?: number;
  category?: Category;
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
/* Tasker request, when he clicks init on any task  */
export interface TaskRequest {
  id: number;
  task_id: number;
  tasker_id: number;
  client_id?: number;
  tasker_username: string;
  tasker_name: string;
  tasker_family_name: string;
  tasker_rating: number;
  tasks_done: number;
  category: string;
  eta: number;
  created_at: string;
  action?: any;
  seen: boolean; 
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
  taskRequests: TaskRequest[];
  isSearching: boolean;
  isInitDialog: boolean; //tasker
  isConfirmDialog: boolean; //tasker
  notifications: Notification[];
  navigationState: InitialState | undefined;
  refreshTaskRequestSocket: number;
  refreshTaskFeedSocket: number,
  currentTaskId: number | null;
  currentTempTaskId: number | null;
  isConnected: boolean;
  snackbarVisible: boolean;
  setSnackbarVisible:(param: boolean) => void;
  setIsConnected: (value: boolean) => void;
  setIsConfirmDialog: (init: boolean, confirm: boolean) => void;
  setCurrentTempTaskId: (param: number | null) => void;
  setRefreshTaskRequestSocket: () => void;
  setRefreshTaskFeedSocket: () => void;
  setIsInitDialog: (param: boolean) => void;
  setNavigationState: (state: InitialState) => void;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  addTaskRequest: (request: TaskRequest) => void;
  deleteTaskRequest: (requestId: number) => void;
  deleteTaskRequests: () => void;
  setTaskRequests: (taskRequests: TaskRequest[]) => void;
  setCurrentTaskId: (taskId: number | null) => void;
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
      currentTaskId: null,
      taskRequests: [],
      isSearching: false,
      notifications: [],
     
      isInitDialog: false,
      isConfirmDialog: false,
      currentTempTaskId: null,
      isConnected: true,
      refreshTaskFeedSocket: 0,
      refreshTaskRequestSocket: 0,
      snackbarVisible: false,
      setSnackbarVisible: (param) => set({ snackbarVisible: param }),  
      setIsConnected: (value) => set({ isConnected: value }),   
      setCurrentTempTaskId: (id: number | null) =>
        set({ currentTempTaskId: id }),
      setIsConfirmDialog: (init, confirm) => set({ isConfirmDialog: init, isInitDialog: confirm }),
      setIsInitDialog: (param) => set({ isInitDialog: param }),
  
   
      setRefreshTaskFeedSocket: () =>
        set((state) => {
          console.log("Force app reload triggered. Current appKey:", state.refreshTaskFeedSocket);
          return { refreshTaskFeedSocket: state.refreshTaskFeedSocket + 1 };
        }),
      setRefreshTaskRequestSocket: () =>
        set((state) => {
          console.log("Force app reload triggered. Current appKey:", state.setRefreshTaskFeedSocket);
          return { refreshTaskRequestSocket: state.refreshTaskRequestSocket + 1 };
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      clearNotifications: () => set({ notifications: [] }),
      setIsSearching: (param) => set({ isSearching: param }),
      setCurrentTaskId: (taskId: number | null) =>
        set({ currentTaskId: taskId }),
      addTaskRequest: (request) =>
        set((state) => ({
          taskRequests: sortRequestsByDateDesc([
            ...state.taskRequests,
            request,
          ]),
        })),
      deleteTaskRequest: (request_id: number) =>
        set((state) => ({
          taskRequests: sortRequestsByDateDesc(
            state.taskRequests.filter((r) => r.id !== request_id),
          ),
        })),
      deleteTaskRequests: () => set({ taskRequests: [] }),
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
      setTaskRequests: (taskRequests: TaskRequest[]) =>
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
