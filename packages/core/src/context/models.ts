import { type BeforeAfterRangesController } from './useBeforeAfterRanges';
import { type ChangesController, type OnChange } from '../changes';
import { type Command } from '../commands';
import { type Mutation } from '../mutations';
import { type BrickStore } from '../store';
import { type ElementSubscribe } from '../utils';

export type BrickContextType = {
  editable: boolean;
  store: BrickStore;
  ranges: BeforeAfterRangesController;

  onChange: OnChange;
  changes: ChangesController;

  subscribeMutation: ElementSubscribe<(mutation: Mutation) => void>;
  subscribeCommand: ElementSubscribe<Command[]>;
};
