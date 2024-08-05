import { type Change } from '@brickifyio/utils/object';

export type ChangeState = 'batch' | 'interaction';

export type OnChange = (...changes: Change[]) => unknown;

export type PropsWithChange = {
  onChange?: OnChange;
};

export type { Change };
