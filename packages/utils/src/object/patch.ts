import { array } from '@brickifyio/operators';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import assert from 'assert';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- could be any
 * type for change
 */
export type Change<Value = any> = {
  type: 'add' | 'remove' | 'update';
  value?: Value;
  path?: string[];
};

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

    if (key) {
      changesMap[key].push(change);
    }
  }

  if (Object.keys(changesMap).length) {
    changesMap[''] = changesMap[''] ?? [];
  }

  return changesMap;
};

export const handleChangesArray = (
  acc: {
    value: unknown;
    previousValues: unknown[];
  },
  change: Change,
) => {
  switch (change.type) {
    case 'update': {
      if (acc.value === 'removed') {
        break;
      }

      if (acc.value === 'unhandled') {
        acc.value = change.value;
        break;
      }

      if (typeof change.value === 'object') {
        acc.value = {
          ...typeof acc.value === 'object' ? acc.value : {},
          ...change.value,
        };
        break;
      }

      acc.value = change.value;
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
      throw new Error(`Unknown mutation type: ${change.type}`);
    }
  }
  return acc;
};

const prepareNewValue = (
  oldValue: unknown,
  newValue: unknown,
  changesMap: Record<string, Change[]>,
  path: string[] = [],
) => {
  if (newValue === 'removed') {
    return [];
  }

  if (!oldValue || typeof oldValue !== 'object') {
    return [newValue === 'unhandled' ? oldValue : newValue];
  }

  const handledValue = (
    // eslint-disable-next-line no-nested-ternary -- ok
    newValue === 'unhandled'
      ? { ...oldValue }
      : typeof newValue === 'object'
        ? { ...oldValue, ...newValue }
        : newValue
  );

  if (typeof handledValue !== 'object' || !handledValue) {
    return [handledValue];
  }

  const recordValue = handledValue as Record<string, unknown>;

  Object.keys(recordValue).forEach((key) => {
    const subPath = [...path, key];
    const isArray = Array.isArray(recordValue[key]);
    const currentResult = traverseAndApplyChanges(
      recordValue[key],
      changesMap,
      subPath,
    );

    recordValue[key] = isArray ? currentResult : array(currentResult)[0];
  });

  return [recordValue];
}

export const traverseAndApplyChanges = (
  value: unknown,
  changesMap: Record<string, Change[]>,
  path: string[] = [],
): unknown => {
  return pipe(
    path.join('/'),
    E.fromPredicate((currentPath) => currentPath in changesMap, () => value),
    E.map((currentPath) => changesMap[currentPath]),
    E.map((changes) => {
      if (Array.isArray(value)) {
        const pathToLastElement = [...path, value.length].join('/');
        return [
          ...value.flatMap((currentValue: unknown, index) => {
            const newValue = traverseAndApplyChanges(
              currentValue,
              changesMap,
              [...path, `${index}`],
            );
            return Array.isArray(currentValue) ? [newValue] : newValue;
          }),
          ...changesMap[pathToLastElement]
            ?.reduce<unknown[]>((acc, change) => {
              if (change.type === 'add') {
                acc.push(change.value);
              }
              return acc;
            }, []) ?? [],
        ];
      }

      // let result = [value];
      const { value: newValue, previousValues } = changes.reduce(
        handleChangesArray,
        { value: 'unhandled', previousValues: [] },
      );
      const result = prepareNewValue(value, newValue, changesMap, path);

      return [...previousValues, ...result];
    }),
    E.getOrElseW(I.of),
  );
};

export const patch = <T = unknown>(
  value: T,
  changes: Change[],
) => pipe(
  makeChangesMap(changes),
  (changesMap) => traverseAndApplyChanges(
    value,
    changesMap,
  ),
  (newValue) => {
    // TODO: do I really want to assert it? Maybe it's ok to return null?
    assert(newValue !== undefined, 'Unexpected removal of root element');
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
     * we need to make an array
     */
    return newValue as T extends any[] ? T : T[];
  },
);
