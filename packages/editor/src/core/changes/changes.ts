import type {
  Change as TreeChange,
} from '@brickifyio/utils/slots-tree';

export type Change = {
  type: TreeChange['type'];
  [key: string]: unknown;
};

export type {
  TreeChange as ChangeEvent,
};
