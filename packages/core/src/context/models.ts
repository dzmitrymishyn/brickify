import { type Node } from '@brickifyio/utils/slots-tree';

import { type ChangesController } from '../changes';
import { type Command, type OnChange } from '../commands';
import { type BrickStore } from '../hooks';
import {
  type BeforeAfterRangesController,
} from '../hooks/useBeforeAfterRanges';
import { type Mutation } from '../mutations';
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
