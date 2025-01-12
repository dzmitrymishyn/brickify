type OverrideFunction<Key extends string, Value> = (
  inherit?: Value,
  context?: { [key in Key]: Value } & Record<string, unknown>,
) => Value;

export const createWith = <Key extends string>(key: Key) => {
  return <Value>(param: Value | OverrideFunction<Key, Value>) => {
    return (context?: { [key in Key]: Value }) => {
      const result = typeof param === 'function'
        ? (param as OverrideFunction<Key, Value>)(context?.[key], context)
        : param;

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
       * Make types exclude functions */
      return { [key]: result } as Value extends (...param: any[]) => any
        ? never
        : { [key in Key]: Value };
    };
  };
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any --
 * Make types exclude functions */
type InheritedCallback<Params extends any[], Result> = (
  ...args: [...Params, ((...params: Params) => Result)?, Record<string, unknown>?]
) => Result;

export const createWithCallback = <Key extends string>(key: Key) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
   * Make types exclude functions */
  return <Params extends any[], Result>(
    callback: InheritedCallback<Params, Result>,
  ) => (context?: { [key in Key]?: (...params: Params) => Result }) => ({
    [key]: (...params: Params) => callback(...params, context?.[key], context),
  } as { [key in Key]: (...params: Params) => Result });
};
