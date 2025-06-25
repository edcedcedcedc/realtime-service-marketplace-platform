import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
export interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  location: string;
  status:
    | "open"
    | "accepted"
    | "in-progress"
    | "completed"
    | "confirmed"
    | "cancelled"
    | "expired";
  urgency: "now" | "soon" | "flexible";
  must_start_by: string | null;
  expires_from_feed: string | null;
  created_at: string;
  updated_at: string | null;
  client: number;
  worker: number | null;
}
interface Jwt {
  access: string | null;
  refresh: string | null;
}
interface Loading {
  loading: boolean
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
  setAuth: (jwt: Jwt, user: User | null) => void;
  clearAuth: () => void;
  addWorker: (worker: User) => void;
  addClient: (client: User) => void;
  addJob: (job: Job) => void;
  setJobs: (jobs: Job[]) => void;
  setLoading: (value: boolean) => void;
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
      setLoading: (value: boolean) => set({ loading: value }),
      setAuth: (jwt: Jwt, user: User | null) => set({ auth: { jwt, user } }),
      clearAuth: () => set({ auth: { jwt: null, user: null } }),
      addWorker: (worker: User) =>
        set((state: { workers: User[] }) => ({
          workers: [...state.workers, worker],
        })),
      addClient: (client: User) =>
        set((state: { clients: User[] }) => ({
          clients: [...state.clients, client],
        })),
      addJob: (job: Job) =>
        set((state: { jobs: Job[] }) => ({ jobs: [...state.jobs, job] })),
      setJobs: (jobs: Job[]) => set({ jobs }),
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
