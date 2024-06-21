// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we can pass anything
export type Log = (message?: any, ...optionalParams: any[]) => void;

export type Logger = {
  log: Log;
  warn: Log;
  error: Log;
  trace: Log;
};
