import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sortJobsByDate } from "../utils/sortJobs";

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

export type JobFormInput = {
  title: string;
  description: string;
  location: string;
  budget: number;
  urgency: string;
};

type Status =
  | "open"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";
export interface Job {
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
  worker_username: string | null;
  worker_id: number | null;
  expires_from_feed: string | null;
  must_start_by: string | null;
  created_at: string;
  updated_at: string | null;
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
  workers: User[];
  clients: User[];
  jobs: Job[];
  loading: boolean;
  tempJobData: JobFormInput | null;
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
  addWorker: (worker: User) => void;
  addClient: (client: User) => void;
  addJob: (job: Job) => void;
  removeJob: (id: number) => void;
  setJobs: (jobs: Job[]) => void;
  setLoading: (value: boolean) => void;
  setTempJobData: (data: JobFormInput | null) => void;
  setSelectedRegion: (region: Region | null) => void;
  setSelectedLatLng: (latLng: LatLng | null) => void;
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
      workers: [],
      clients: [],
      jobs: [],
      loading: false,
      tempJobData: null,
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
      setTempJobData: (data) => set({ tempJobData: data }),
      setLoading: (value: boolean) => set({ loading: value }),
      setAuth: (jwt: Jwt, user: User | null) => set({ auth: { jwt, user } }),
      clearAuth: () =>
        set((state) => ({
          auth: {
            jwt: { access: null, refresh: null },
            user: state.auth.user, // keep user info if you want
          },
        })),
      addWorker: (worker: User) =>
        set((state: { workers: User[] }) => ({
          workers: [...state.workers, worker],
        })),
      addClient: (client: User) =>
        set((state: { clients: User[] }) => ({
          clients: [...state.clients, client],
        })),
      addJob: (job: Job) =>
        set((state: { jobs: Job[] }) => ({
          jobs: sortJobsByDate([...state.jobs, job]),
        })),
      removeJob: (id: number) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),
      setJobs: (jobs: Job[]) => set({ jobs: sortJobsByDate(jobs) }),
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
