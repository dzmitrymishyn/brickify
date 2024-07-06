import { type Change } from '../changes';
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
  trackChange: (change: Change) => Change;

  subscribeMutation: ElementSubscribe<(mutation: Mutation) => void>;
  clearMutations: () => void;

  // subscribeCommand: ElementSubscribe<() => void>;
};
