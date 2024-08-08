import { type ReactElement } from 'react';

import { type OnChange } from '../changes';
import { type Command } from '../commands';
import { type MutationHandler } from '../mutations';
import { type PathRef } from '../utils';

export type BrickStoreValue = {
  value: object;
  pathRef: PathRef;
  react?: ReactElement;
  slotsTreeNode: object;
  slotsTreeParent?: object;
  domNode?: Node;
  onChange?: OnChange;
  commands?: Command[];
  mutate?: MutationHandler;
  applyChanges?: () => void;
  slots?: Record<string, Record<string, object>>;
};

export type BrickStoreKey = object | Node;

export type BrickStore = {
  get: (key: BrickStoreKey) => BrickStoreValue | undefined;
  set: (key: BrickStoreKey, value: BrickStoreValue) => void;
  update: (key: BrickStoreKey, value: Partial<BrickStoreValue>) => void;
  remove: (key: BrickStoreKey) => boolean;
};
