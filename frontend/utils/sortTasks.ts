import { Task } from "../store/useStore";

export function sortTasksByDate(tasks: Task[]): Task[] {
  //0 do nothing, 1 descending, -1 ascending
  return [...tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
