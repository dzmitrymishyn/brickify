import { type ReactElement } from 'react';

import { type OnChange } from '../changes';
import { type Command } from '../commands';
import { type MutationHandler } from '../mutations';
import { type PathRef } from '../utils';

export type BrickStoreValue<Value = any> = {
  value: Value;
  pathRef: PathRef;
  react?: ReactElement;
  domNode?: Node;

  mutate?: MutationHandler;
  onChange?: OnChange;
  applyChanges?: () => void;

  commands?: Command[];
  slots?: Record<string, Record<string, object>>;
};

export type BrickStoreKey = object | Node;

export type BrickStore = {
  get: <Value = any>(key: BrickStoreKey) => BrickStoreValue<Value> | undefined;
  set: (key: BrickStoreKey, value: BrickStoreValue) => void;
  update: (key: BrickStoreKey, value: Partial<BrickStoreValue>) => void;
  delete: (key: BrickStoreKey) => boolean;
};
