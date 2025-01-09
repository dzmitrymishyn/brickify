export type Results<T extends object = object> = Record<string, unknown> & T;

export type ResultsFn<T extends object = object> = {
  <Param extends keyof T>(key: Param): T[Param];
  <R>(key: string): R;
  (data: Partial<Results<T>>): void;
};

export const makeResults = <T extends object = object>(defaultValues?: T) => {
  const results = {
    ...defaultValues,
  } as Results<T>;

  const getOrSetResults: ResultsFn<T> = (
    nameOrOptions: unknown,
  ) => {
    if (typeof nameOrOptions === 'string') {
      return results[nameOrOptions];
    }

    if (typeof nameOrOptions === 'object') {
      Object.assign(results, nameOrOptions || {});
    }
  };

  return getOrSetResults;
};
