import { flow } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import { Change } from './change';
import { Node } from './node';
import { array } from '@/shared/operators';

const removedElement = Symbol('Tree: removed item');

const buildChangesMap = (changes: Change[]) => {
  const changesMap: Record<string, Change[]> = {};

  changes.forEach((change) => {
    const { path } = change;

    const key = path.reduce((acc, item) => {
      const current = `${acc}${acc ? '/' : ''}${item}`;

      if (!changesMap[current]) {
        changesMap[current] = [];
      }

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
  node: any,
  changesMap: Record<string, Change[]>,
  currentPath: string[] = [],
) => {
  const pathKey = currentPath.join('/');

  if (pathKey && !changesMap[pathKey]) {
    return node.value;
  }

  let newValue: any = { ...node.value };

  if (changesMap[pathKey]?.length) {
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
          throw new Error('Unknown mutation type', { cause: change });
      }

      return false;
    });
  }

  if (newValue === removedElement) {
    return removedElement;
  }

  if (node && typeof node === 'object' && !Array.isArray(node)) {
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
