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
) => {
  if (newValue === removed) {
    return removed;
  }

  if (!oldValue || typeof oldValue !== 'object') {
    return newValue === 'unhandled' ? oldValue : newValue;
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
    return handledValue;
  }

  const oldValueRecord = oldValue as Record<string, unknown>;
  let updatedFields = 0;

  Object.keys(handledValue).forEach((key) => {
    const currentResult = traverseAndApplyChanges(
      [...path, key],
      handledValue[key],
      changesMap,
    );

    handledValue[key] = currentResult === removed ? null : currentResult;

    if (handledValue[key] !== oldValueRecord[key]) {
      updatedFields += 1;
    }
  });

  return updatedFields ? handledValue : oldValue;
};

const handleArrayUpdate = (
  path: string[],
  value: unknown,
  changesMap: Record<string, Change[]>,
) => {
  const stringPath = path.join('/');
  const results = changesMap[stringPath]
    ?.reduce<unknown[]>((acc, change) => {
      if (change.type === 'add') {
        acc.push(change.value);
      }
      return acc;
    }, []) ?? [];

  const newValue = traverseAndApplyChanges(path, value, changesMap);

  if (newValue !== removed) {
    results.push(newValue);
  }

  return results;
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
  value: unknown,
  changesMap: Record<string, Change[]>,
): unknown => {
  return pipe(
    path.join('/'),
    E.fromPredicate((currentPath) => currentPath in changesMap, () => value),
    E.map((currentPath) => changesMap[currentPath]),
    E.map((changes) => {
      if (Array.isArray(value)) {
        return [
          ...value.flatMap((currentValue: unknown, index) => handleArrayUpdate(
            [...path, `${index}`],
            currentValue,
            changesMap,
          )),
          ...handleArrayUpdate(
            [...path, `${value.length}`],
            removed,
            changesMap,
          ),
        ];
      }

      const newValue = changes.reduce(handleNonArrayUpdate, 'unhandled');
      const result = prepareNewValue(value, newValue, changesMap, path);

      return result;
    }),
    E.getOrElseW(I.of),
  );
});

export const patch = <T = unknown>(
  value: T,
  changes: Change[],
): T | null => pipe(
  makeChangesMap(changes),
  traverseAndApplyChanges([], value),
  (newValue) => newValue === removed ? null : newValue as T,
);
