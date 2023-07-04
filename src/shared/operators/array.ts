export const array = <T>(v?: T): T extends Array<any> ? T : T[] =>
  (Array.isArray(v) ? v as any : [v]);
