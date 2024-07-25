import { type Change } from './changes';

export type OnChange = (...changes: Change[]) => unknown;

export type PropsWithChange = {
  onChange?: OnChange;
};
