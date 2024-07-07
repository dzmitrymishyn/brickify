// eslint-disable-next-line -- we can pass anything and we need to use any
export type Log = (message?: any, ...optionalParams: any[]) => void;

export type Logger = {
  log: Log;
  warn: Log;
  error: Log;
  trace: Log;
  group?: (label?: string) => void;
  groupEnd?: () => void;
};
