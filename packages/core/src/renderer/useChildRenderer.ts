import { tap } from '@brickifyio/operators';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import { type ReactElement, type ReactNode, useMemo, useRef } from 'react';

import { useBrickContext } from '../hooks';
import { type BrickStoreValue } from '../store';
import assert from 'assert';

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

type ObjectValue<Value> = Value extends Primitive
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

export const useChildRenderer = <Value = unknown>(
  parentBrick: BrickStoreValue<object>,
  slotName: string,
  slotValue: Value,
  make: ((brick: BrickStoreValue<ObjectValue<Value>>) => ReactElement),
): ReactNode => {
  const { store } = useBrickContext();
  const storedParent = store.get(parentBrick.value);

  assert(storedParent, 'Brick should be specified');

  const previoueValue = useRef<Value>();
  const previousObjectValue = useRef<ObjectValue<Value>>();

  const makeRef = useRef(make);
  makeRef.current = make;

  return useMemo(() => pipe(
    makeObjectValue(
      slotValue,
      previoueValue.current,
      previousObjectValue.current,
    ),
    I.bindTo('value'),
    I.bind('stored', ({ value }) => store.get(value as object)),
    tap(({ value }) => {
      previoueValue.current = slotValue;
      previousObjectValue.current = value;
    }),
    I.bind('pathRef', () => ({
      current: () => [...storedParent.pathRef.current(), slotName],
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
        brick.react = makeRef.current(brick);
        return O.of(brick.react);
      }),
      O.getOrElseW(() => null),
    ),
  ), [slotName, slotValue, store, storedParent]);
};
