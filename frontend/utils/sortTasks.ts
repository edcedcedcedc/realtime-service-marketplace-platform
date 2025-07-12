import { Task } from "../store/useStore";

export const sortTasksByDate = (tasks: Task[]): Task[] =>
  [...tasks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
