import { type Log } from './logger';

// eslint-disable-next-line @typescript-eslint/no-empty-function -- it's expected
const empty: Log = () => {};

export const EmptyLogger = {
  log: empty,
  warn: empty,
  error: empty,
  trace: empty,
};
