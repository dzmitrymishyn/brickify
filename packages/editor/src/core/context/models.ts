import { type ChangesController } from '../changes';
import { type Command, type OnChange } from '../commands';
import {
  type BeforeAfterRangesController,
} from '../hooks/useBeforeAfterRanges';
import { type Cache } from '../hooks/useBrickCache';
import { type Logger } from '../logger';
import { type Mutation } from '../mutations';
import { type ElementSubscribe, type PathRef } from '../utils';

export type BrickContextType = {
  editable: boolean;
  cache: Cache;
  pathRef: PathRef;

  logger: Logger;
  ranges: BeforeAfterRangesController;
  changes: ChangesController;
  subscribeMutation: ElementSubscribe<(mutation: Mutation) => void>;
  subscribeCommand: ElementSubscribe<() => {
    onChange?: OnChange;
    handlers: Command[];
  }>;
};
