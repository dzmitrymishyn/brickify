import { array } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import assert from 'assert';

export type Change<Value = any> = {
  type: 'add' | 'remove' | 'update';
  value?: Value;
  path?: string[];
};

export const makeChangesMap = (changes: Change[]) => pipe(
  changes,
  A.reduce<Change, Record<string, Change[]>>({}, (changesMap, change) => {
    assert(Array.isArray(change.path), 'path must be provided into update');

    // To understand next children updates path we need to populate changesMap
    // with all the keys, it gives us an opportunity to go only into updated
    // path
    const key = change.path.reduce((acc, item) => {
      const current = `${acc}${acc ? '/' : ''}${item}`;

      changesMap[current] = changesMap[current] ?? [];

      return current;
    }, '');

    if (key) {
      changesMap[key].push(change);
    }

    return changesMap;
  }),
  (changesMap) => {
    if (Object.keys(changesMap).length) {
      changesMap[''] = changesMap[''] || [];
    }
    return changesMap;
  },
);

export const handleChangesArray = (
  acc: {
    value: unknown;
    previousValues: unknown[];
  },
  change: Change,
) => {
  switch (change.type) {
    case 'update': {
      if (acc.value !== 'removed') {
        if (acc.value === 'unhandled') {
          acc.value = change.value;
        } else if (typeof change.value !== 'object' || !change.value) {
          acc.value = change.value;
        } else if (typeof change.value === 'object') {
          acc.value = {
            ...typeof acc.value === 'object' ? acc.value : {},
            ...change.value,
          };
        }
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
        return [
          ...value.flatMap((currentValue: unknown, index) => {
            const currentPath = [...path, `${index}`];
            const newValue = traverseAndApplyChanges(
              currentValue,
              changesMap,
              currentPath,
            );
            return Array.isArray(currentValue) ? [newValue] : newValue;
          }),
          ...pipe(
            [...path, value.length].join('/'),
            (lastElementsPath) => changesMap[lastElementsPath] ?? [],
            A.reduce<Change, unknown[]>([], (acc, change) => {
              if (change.type === 'add') {
                acc.push(change.value);
              }
              return acc;
            }),
          ),
        ];
      }

      let result = [value];
      const { value: newValue, previousValues } = changes.reduce(
        handleChangesArray,
        { value: 'unhandled', previousValues: [] },
      );

      if (newValue === 'removed') {
        result = [];
      } else if (!value || typeof value !== 'object') {
        result = [newValue === 'unhandled' ? value : newValue];
      } else {
        const handledValue = (
          // eslint-disable-next-line no-nested-ternary -- ok
          newValue === 'unhandled'
            ? value
            : typeof newValue === 'object' && newValue
              ? { ...value, ...newValue }
              : newValue
        );

        if (typeof handledValue !== 'object' || !handledValue) {
          result = [handledValue];
        } else {
          const recordValue = handledValue as Record<string, unknown>;
          const keys = Object.keys(recordValue);
          let handledKeys = newValue === 'unhandled' ? 0 : 1;

          keys.forEach((key) => {
            const subPath = [...path, key];
            const isArray = Array.isArray(recordValue[key]);
            const currentResult = traverseAndApplyChanges(
              recordValue[key],
              changesMap,
              subPath,
            );

            if (recordValue[key] !== currentResult) {
              handledKeys += 1;
            }

            recordValue[key] = isArray ? currentResult : array(currentResult)[0];
          });
          result = [handledKeys === 0 ? value : recordValue];
        }
      }

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
    assert(newValue !== undefined, 'Unpredictable removal of root element');
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
     * we need to make an array
     */
    return newValue as T extends any[] ? T : T[];
  },
);
