import { array } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';

import { type Change } from './change';
import { type Node } from './node';

const removedElement = Symbol('Tree: removed item');

const buildChangesMap = (changes: Change[]) => {
  const changesMap: Record<string, Change[]> = {};

  changes.forEach((change) => {
    const { path } = change;

    const key = path.reduce((acc, item) => {
      const current = `${acc}${acc ? '/' : ''}${item}`;

      changesMap[current] = changesMap[current] ?? [];

      return current;
    }, '');

    changesMap[key].push(change);
  });

  return changesMap;
};

const removeRemovedItems = flow(
  array<unknown>,
  A.filter((item) => item !== removedElement),
  (items) => {
    if (items.length === 1) {
      return items[0];
    }

    return items.length ? items : null;
  },
);

const traverseAndApplyChanges = (
  /* eslint @typescript-eslint/no-explicit-any: warn -- use fine type */
  node: any,
  changesMap: Record<string, Change[]>,
  currentPath: string[] = [],
) => {
  const pathKey = currentPath.join('/');

  /* eslint @typescript-eslint/no-unnecessary-condition: off -- check this place*/
  if (pathKey && !changesMap[pathKey]) {
    /* eslint @typescript-eslint/no-unsafe-member-access: warn -- check this place */
    /* eslint @typescript-eslint/no-unsafe-return: warn -- check this place */
    return node.value;
  }
  /* eslint @typescript-eslint/no-unsafe-return: warn -- check this place */
  /* eslint @typescript-eslint/no-unsafe-assignment: warn -- check this place */
  let newValue: any = { ...node.value };

  if (changesMap[pathKey].length) {
    changesMap[pathKey].find((change) => {
      switch (change.type) {
        // TODO: Add `add` handler
        case 'remove':
          newValue = removedElement;
          return true;
        case 'update':
          newValue = change.value;
          break;
        default:
          throw new Error('Unknown mutation type');
      }

      return false;
    });
  }

  if (newValue === removedElement) {
    return removedElement;
  }

  if (node && typeof node === 'object' && !Array.isArray(node)) {
    /* eslint @typescript-eslint/no-unsafe-return: warn -- check this place */
    /* eslint @typescript-eslint/no-unsafe-argument: warn -- check this place */
    const keys = Object.keys(node.slots);
    keys.forEach((key) => {
      newValue[key] = removeRemovedItems(traverseAndApplyChanges(
        node.slots[key],
        changesMap,
        [...currentPath, key],
      ));
    });
  } else if (Array.isArray(node)) {
    newValue = removeRemovedItems(node.flatMap((item, index) => traverseAndApplyChanges(
      item,
      changesMap,
      [...currentPath, index.toString()],
    )));
  }

  return newValue;
};

export const patch = (root: Node, changes: Change[]) => {
  const changesMap = buildChangesMap(changes);

  return removeRemovedItems(traverseAndApplyChanges(root, changesMap, []));
};
