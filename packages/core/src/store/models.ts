import { type Node as TreeNode } from '@brickifyio/utils/slots-tree';
import { type ReactElement } from 'react';

import { type OnChange } from '../changes';
import { type PathRef } from '../utils';

export type BrickStoreValue = {
  value: object;
  pathRef: PathRef;
  react?: ReactElement;
  slotsTreeNode: TreeNode;
  slotsTreeParent?: TreeNode;
  domNode?: Node;
  onChange?: OnChange;
};

export type BrickStoreKey = object | Node;

export type BrickStore = {
  get: (key: BrickStoreKey) => BrickStoreValue | undefined;
  set: (key: BrickStoreKey, value: BrickStoreValue) => void;
  remove: (key: BrickStoreKey) => boolean;
};
