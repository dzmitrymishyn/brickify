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

  commands?: Command[];
  slots?: Record<string, Record<string, object>>;
};
