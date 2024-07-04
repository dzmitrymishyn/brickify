export const debug = <T>(arg: T) => {
  // eslint-disable-next-line -- it's only for development purposes
  debugger;
  return arg;
};
