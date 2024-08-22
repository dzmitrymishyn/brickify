import { type Change } from '@brickifyio/utils/object';

export type ChangeState = 'batch' | 'interaction';

export { type Change };

export type OnChange<Value = any> = (
  event: Change<Value>,
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
