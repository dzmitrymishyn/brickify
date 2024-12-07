import { type Change } from '@brickifyio/utils/object';

export { type Change };

export type OnChange<Value = unknown> = (
  event: Change<Value>,
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
