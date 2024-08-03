import { type Node } from '@brickifyio/utils/slots-tree';

import {
  type BeforeAfterRangesController,
} from './useBeforeAfterRanges';
import { type ChangesController, type OnChange } from '../changes';
import { type Command } from '../commands';
import { type Mutation } from '../mutations';
import { type BrickStore } from '../store';
import { type ElementSubscribe, type PathRef } from '../utils';

export type BrickContextType = {
  editable: boolean;
  store: BrickStore;
  pathRef?: PathRef;

  rootTreeNode: Node;
  ranges: BeforeAfterRangesController;
  changes: ChangesController;
  subscribeMutation: ElementSubscribe<(mutation: Mutation) => void>;
  subscribeCommand: ElementSubscribe<() => {
    onChange?: OnChange;
    handlers: Command[];
  }>;
};
