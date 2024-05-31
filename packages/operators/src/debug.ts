export const debug = <T>(arg: T) => {
  // eslint-disable-next-line -- we need to enable debugger for the development purposes
  debugger;
  return arg;
};
