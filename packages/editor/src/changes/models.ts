export type OnChange<Value = unknown> = (
  change: Partial<Value | undefined>,
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
