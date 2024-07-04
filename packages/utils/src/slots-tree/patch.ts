import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { type Change } from './change';
import { type Node } from './node';
import assert from 'assert';

type NewValue = 'unhandled' | 'removed' | object;

export const makeChangesMap = (changes: Change[]) => pipe(
  changes,
  A.reduce<Change, Record<string, Change[]>>({}, (changesMap, change) => {
    // To understand next children updates path we need to populate changesMap
    // with all the keys, it gives us an opportunity to go only into updated
    // path
    const key = change.path.reduce((acc, item) => {
      const current = `${acc}${acc ? '/' : ''}${item}`;

      changesMap[current] = changesMap[current] ?? [];

      return current;
    }, '');

    changesMap[key].push(change);

    return changesMap;
  }),
  (changesMap) => {
    if (Object.keys(changesMap).length) {
      changesMap[''] = changesMap[''] || [];
    }
    return changesMap;
  },
);

export const traverseArray = (
  nodes: Node[],
  changesMap: Record<string, Change[]>,
  currentPath: string[],
): object[] => pipe(
  nodes,
  A.flatMap((node: Node, index) => traverseAndApplyChanges(
    node,
    changesMap,
    [...currentPath, `${index}`],
  )),
  I.bindTo('startArray'),
  I.bind('endArray', () => pipe(
    [...currentPath, nodes.length].join('/'),
    (lastElementsPath) => changesMap[lastElementsPath] ?? [],
    A.reduce<Change, object[]>([], (acc, change) => {
      if (change.type === 'add') {
        acc.push(change.value);
      }
      return acc;
    }),
  )),
  ({ startArray, endArray }) => [...startArray, ...endArray],
);

export const prepareNewValue = (
  node: Node,
  changesMap: Record<string, Change[]>,
  currentPath: string[],
) => (value: NewValue) => {
  if (value === 'removed') {
    return [];
  }

  const newValue = (
    value === 'unhandled' ? { ...node.value } : value
  ) as Record<string, object[]>;

  const keys = Object.keys(node.slots);

  keys.forEach((key) => {
    newValue[key] = traverseArray(
      node.slots[key],
      changesMap,
      [...currentPath, key],
    );
  });

  return [newValue];
};

export const handleChangeInArray = (
  acc: {
    value: NewValue;
    previousValues: object[];
  },
  change: Change,
) => {
  switch (change.type) {
    case 'update': {
      if (acc.value !== 'removed') {
        acc.value = change.value;
      }
      break;
    }
    case 'add': {
      acc.previousValues.push(change.value);
      break;
    }
    case 'remove': {
      acc.value = 'removed';
      break;
    }
    default: {
      assert.fail('Unknown mutation type');
    }
  }
  return acc;
};

export const traverseAndApplyChanges = (
  node: Node,
  changesMap: Record<string, Change[]>,
  currentPath: string[] = [],
): object[] => {
  assert(node, 'Node should be specified');

  return pipe(
    currentPath.join('/'),
    E.fromPredicate((pathKey) => pathKey in changesMap, () => [node.value]),
    E.map((pathKey) => changesMap[pathKey]),
    E.map(flow(
      A.reduce(
        { value: 'unhandled', previousValues: [] },
        handleChangeInArray,
      ),
      I.bind('newValue', flow(
        ({ value }) => value,
        prepareNewValue(node, changesMap, currentPath),
      )),
      ({ previousValues, newValue }) => [...previousValues, ...newValue],
    )),
    E.getOrElse(I.of),
  );
};

export const patch = (root: Node, changes: Change[]) => pipe(
  makeChangesMap(changes),
  (changesMap) => traverseAndApplyChanges(root, changesMap),
  ([newRootNode]) => {
    // TODO: do I really want to assert it? Maybe it's ok to return null?
    assert(newRootNode !== undefined, 'Unpredictable removal of root element');
    return newRootNode;
  },
);
