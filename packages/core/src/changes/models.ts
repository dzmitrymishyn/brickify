import { type Change } from '@brickifyio/utils/object';

export type ChangeState = 'batch' | 'interaction';

export { type Change };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- should handle any type
export type OnChange<Value = any> = (
  event: Change<Value>,
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
