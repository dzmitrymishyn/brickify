import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { curry } from '../functions';
import assert from 'assert';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- could be any
 * type for change
 */
export type Change<Value = any> = {
  type: 'add' | 'remove' | 'update';
  value?: Value;
  path?: string[];
};

const removed = Symbol('removed');

const makeChangesMap = (changes: Change[]) => {
  const changesMap: Record<string, Change[]> = {};

  for (const change of changes) {
    const { path } = change;

    assert(
      Array.isArray(path),
      `Invalid path in change: ${JSON.stringify(change)}`,
    );

    const key = path.reduce((acc, segment) => {
      const currentPath = `${acc}${acc ? '/' : ''}${segment}`;

      changesMap[currentPath] = changesMap[currentPath] ?? [];

      return currentPath;
    }, '');

    if (key !== null && key !== undefined) {
      changesMap[key] = changesMap[key] ?? [];
      changesMap[key].push(change);
    }
  }

  if (Object.keys(changesMap).length) {
    changesMap[''] = changesMap[''] ?? [];
  }

  return changesMap;
};

const prepareNewValue = (
  oldValue: unknown,
  newValue: unknown,
  changesMap: Record<string, Change[]>,
  path: string[] = [],
  shadowPath: string[] = [],
): [unknown, Change[]] => {
  if (newValue === removed) {
    return [removed, [{ type: 'add', path: shadowPath, value: oldValue }]];
  }

  if (!oldValue || typeof oldValue !== 'object') {
    return [
      newValue === 'unhandled' ? oldValue : newValue,
      newValue === 'unhandled'
        ? []
        : [{ type: 'update', value: oldValue, path: shadowPath }],
    ];
  }

  const handledValue = (
    // eslint-disable-next-line no-nested-ternary -- ok
    newValue === 'unhandled'
      ? { ...oldValue }
      : typeof newValue === 'object'
        ? { ...oldValue, ...newValue }
        : newValue
  ) as Record<string, unknown>;

  if (typeof handledValue !== 'object' || !handledValue) {
    return [handledValue, [{ type: 'update', path: shadowPath, value: oldValue }]];
  }

  const oldValueRecord = oldValue as Record<string, unknown>;
  let updatedFields = 0;
  const changesToRevert: Change[] = newValue === 'unhandled' ? [] : [
    { type: 'update', value: oldValue, path: shadowPath },
  ];

  Object.keys(handledValue).forEach((key) => {
    const [currentResult, changesToRevertChildren] = traverseAndApplyChanges(
      [...path, key],
      [...shadowPath, key],
      handledValue[key],
      changesMap,
    );

    changesToRevert.push(...changesToRevertChildren);
    handledValue[key] = currentResult === removed ? null : currentResult;

    if (handledValue[key] !== oldValueRecord[key]) {
      updatedFields += 1;
    }
  });

  return [
    updatedFields ? handledValue : oldValue,
    changesToRevert,
  ];
};

const handleArrayUpdate = (
  path: string[],
  shadowPath: string[],
  value: unknown,
  changesMap: Record<string, Change[]>,
): [unknown[], Change[]] => {
  let newIndex = Number(shadowPath.at(-1));
  const changesToRevert: Change[] = [];
  const stringPath = path.join('/');
  const results = changesMap[stringPath]
    ?.reduce<unknown[]>((acc, change) => {
      if (change.type === 'add') {
        acc.push(change.value);
        changesToRevert.push({
          path: [...shadowPath.slice(0, -1) ?? [], `${newIndex}`],
          type: 'remove',
        });
        newIndex += 1;
      }
      return acc;
    }, []) ?? [];

  const [newValue, c] = traverseAndApplyChanges(
    path,
    [...shadowPath.slice(0, -1), `${newIndex}`],
    value,
    changesMap,
  );

  changesToRevert.push(...c);

  if (newValue !== removed) {
    results.push(newValue);
  }

  return [results, changesToRevert];
};

const handleNonArrayUpdate = (
  acc: unknown,
  change: Change,
) => {
  if (acc === removed) {
    return removed;
  }

  switch (change.type) {
    case 'update': {
      if (typeof change.value === 'object' && change.value) {
        return {
          ...typeof acc === 'object' ? acc : {},
          ...change.value,
        } as unknown;
      }

      return change.value as unknown;
    }
    case 'remove': {
      return removed;
    }
    default: {
      return acc;
    }
  }
};

const traverseAndApplyChanges = curry((
  path: string[],
  shadowPath: string[],
  value: unknown,
  changesMap: Record<string, Change[]>,
): [unknown, Change[]] => {
  return pipe(
    path.join('/'),
    E.fromPredicate(
      (currentPath) => currentPath in changesMap,
      (): [unknown, Change[]] => [value, []],
    ),
    E.map((currentPath) => changesMap[currentPath]),
    E.map((changes): [unknown, Change[]] => {
      const revertChanges: Change[] = [];

      if (Array.isArray(value)) {
        let newIndex = 0;
        const existedItems = value.flatMap((currentValue: unknown, index) => {
          const [results, childChanges] = handleArrayUpdate(
            [...path, `${index}`],
            [...shadowPath, `${newIndex}`],
            currentValue,
            changesMap,
          );
          revertChanges.push(...childChanges);
          newIndex += results.length;
          return results;
        });

        const [addedItems, addedItemsChangesToRevert] = handleArrayUpdate(
          [...path, `${value.length}`],
          [...shadowPath, `${newIndex}`],
          removed,
          changesMap,
        );

        revertChanges.push(...addedItemsChangesToRevert);

        return [[...existedItems, ...addedItems], revertChanges];
      }

      const newValue = changes.reduce(handleNonArrayUpdate, 'unhandled');
      const [result, c] = prepareNewValue(value, newValue, changesMap, path, shadowPath);

      revertChanges.push(...c);

      return [result, revertChanges];
    }),
    E.getOrElse(I.of),
  );
});

export const patch = <T = unknown>(
  value: T,
  changes: Change[],
): [T | null, Change[]] => pipe(
  makeChangesMap(changes),
  traverseAndApplyChanges([], [], value),
  ([newValue, revertChanges]) => [
    newValue === removed ? null : newValue as T,
    revertChanges,
  ],
);
