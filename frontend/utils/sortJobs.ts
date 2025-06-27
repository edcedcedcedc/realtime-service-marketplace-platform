import { Job } from "../store/useStore"; 

export function sortJobsByDate(jobs: Job[]): Job[] {
    //0 do nothing, 1 descending, -1 ascending
  return [...jobs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}