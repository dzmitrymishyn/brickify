export type OnChange<Value = unknown> = (
  change: Partial<Value | undefined>,
  pathSuffix?: string[],
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
