import { tap } from '@brickifyio/operators';
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import { type ReactElement, type ReactNode, useMemo, useRef } from 'react';

import { useBrickContext } from '../hooks';
import { type BrickStoreValue } from '../store';
import assert from 'assert';

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type ObjectValue<Value> = Value extends Primitive
  ? { value: Value }
  : Value;

const isPrimitive = (value: unknown): value is Primitive =>
  (!value || typeof value !== 'object') && typeof value !== 'function';

const makeObjectValue = <Value>(
  value: Value,
  oldValue?: Value,
  oldObjectValue?: ObjectValue<Value>,
): ObjectValue<Value> => pipe(
  isPrimitive(value) ? { value } : value as ObjectValue<Value>,
  (objectValue) => (
    oldObjectValue && oldValue === value
      ? oldObjectValue
      : objectValue
  ) as ObjectValue<Value>,
);

export const useChildrenRenderer = <Value = unknown>(
  parentBrick: BrickStoreValue<object>,
  slotName: string | undefined | null,
  slotValues: Value[] | Record<string, Value>,
  make: ((brick: BrickStoreValue<ObjectValue<Value>>, key: string) => ReactElement),
): ReactNode[] => {
  const { store } = useBrickContext();
  const storedParent = store.get(parentBrick.value);

  assert(storedParent, 'parent value is not registered in the store');

  const previoueValues = useRef<Record<string, Value>>({});
  const previousObjectValues = useRef<Record<string, ObjectValue<Value>>>({});

  const makeRef = useRef(make);
  makeRef.current = make;

  return useMemo(() => pipe(
    Object.entries(slotValues),
    A.map(([index, currentValue]) => pipe(
      makeObjectValue(
        currentValue,
        previoueValues.current[index],
        previousObjectValues.current[index],
      ),
      I.bindTo('value'),
      I.bind('stored', ({ value }) => store.get(value as object)),
      tap(({ value }) => {
        previoueValues.current[index] = currentValue;
        previousObjectValues.current[index] = value;
      }),
      I.bind('pathRef', () => ({
        current: () => [
          ...storedParent.pathRef.current(),
          ...slotName ? [slotName] : [],
          `${index}`,
        ],
      })),
      ({ pathRef, value, stored }) => pipe(
        O.fromNullable(stored),
        O.map(tap((storedParam) => {
          // We need to mutate previous pathRef.current function with new one
          // since we can change the ordering of items and it should handle
          // the change inside the current stored element
          storedParam.pathRef.current = pathRef.current;
        })),
        O.chain(({ react }) => O.fromNullable(react)),
        O.alt(() => {
          const brick: BrickStoreValue = { pathRef, value };
          brick.react = makeRef.current(brick, index);
          return O.of(brick.react);
        }),
        O.getOrElseW(() => null),
      ),
    )),
  ), [slotName, slotValues, store, storedParent]);
};
