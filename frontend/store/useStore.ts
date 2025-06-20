import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  role: "worker" | "client";
}
interface Job {
  id: number;
  title: string;
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
  workers: User[];
  clients: User[];
  jobs: Job[];

  setAuth: (jwt: Jwt, user: User | null) => void;
  clearAuth: () => void;
  addWorker: (worker: User) => void;
  addClient: (client: User) => void;
  addJob: (job: Job) => void;
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
      partialize: (state) => ({
        auth: {
          jwt: { refresh: state.auth.jwt?.refresh ?? null },
          user: state.auth.user,
        },
      }),
    },
  ),
);

export default useStore;
