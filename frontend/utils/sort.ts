import { TaskRequest, Task } from "../store/useStore";

export const sortTasksByDateDesc = (tasks: Task[]): Task[] =>
  [...tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

export function sortRequestsByDateDesc(requests: TaskRequest[]): TaskRequest[] {
  return [...requests].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
