export const tap = <T>(fn: (arg: T) => void) => (arg: T) => {
  fn(arg);
  return arg;
};
