import { type ChangesController } from '../changes';
import { type HandleCommand } from '../commands';
import {
  type BeforeAfterRangesController,
} from '../hooks/useBeforeAfterRanges';
import { type Logger } from '../logger';
import { type Mutation } from '../mutations';

type Unsubscribe = () => void;

type ElementSubscribe<Fn> = (
  element: HTMLElement,
  mutate: Fn,
) => Unsubscribe;

export type BrickContextType = {
  logger: Logger;

  ranges: BeforeAfterRangesController;

  editable: boolean;
  // state: () => {
  //   changes: 'interaction' | 'batch';
  //   editable: boolean;
  // };

  changes: ChangesController;
  subscribeMutation: ElementSubscribe<(mutation: Mutation) => void>;
  subscribeCommand: ElementSubscribe<HandleCommand>;
};
