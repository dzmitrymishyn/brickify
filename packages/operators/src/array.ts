export const array = <T>(v?: T) => (
  Array.isArray(v) ? v : [v]
  // eslint-disable-next-line -- Generic type have to use any
) as T extends any[] ? T : T[];
