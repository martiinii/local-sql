export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage = `Operation timeout out after ${ms}ms`,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let timerId: NodeJS.Timeout | undefined;
    timerId = setTimeout(() => {
      timerId = undefined;
      reject(new TimeoutError(timeoutMessage));
    }, ms);

    promise
      .then((value) => {
        if (timerId) {
          clearTimeout(timerId);
          timerId = undefined;
          resolve(value);
        }
      })
      .catch((error) => {
        if (timerId) {
          clearTimeout(timerId);
          timerId = undefined;
          reject(error);
        }
      });
  });
};
