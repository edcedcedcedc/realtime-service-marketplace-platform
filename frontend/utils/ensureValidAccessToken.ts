import api from "../services/api";
import useStore from "../store/useStore";

export async function ensureValidAccessToken(): Promise<string | null> {
  const store = useStore.getState();
  const access = store.auth.jwt?.access;

  if (!access) return null;

  try {
    // Use existing protected endpoint, like /api/profile/
    await api.get("protected/");

    // If request succeeds or token was refreshed, return latest token
    return useStore.getState().auth.jwt?.access ?? null;
  } catch (err) {
    console.warn("Access token invalid or refresh failed.");
    return null;
  }
}
