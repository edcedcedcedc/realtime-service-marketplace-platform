export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  timeoutMessage = "Request timed out",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs),
    ),
  ]);
}
