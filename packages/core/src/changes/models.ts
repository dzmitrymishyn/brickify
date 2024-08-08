import { type Change } from '@brickifyio/utils/object';

export type ChangeState = 'batch' | 'interaction';

export { type Change };

export type OnChange<Value = any> = (
  value: Value,
  change: Partial<Pick<Change, 'path' | 'type'> & { brick: object }>,
) => void;

export type PropsWithChange<Value = unknown> = {
  onChange?: OnChange<Value>;
};
