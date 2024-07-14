import { type Change } from './changes';

export type OnChange = (...changes: Partial<Change>[]) => unknown;

export type PropsWithChange = {
  onChange?: OnChange;
};
