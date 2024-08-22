import { type ReactElement, useMemo, useRef } from 'react';

import { useBrickContext } from './useBrickContext';
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

export const useBrickChildrenRegistry = <Value = unknown>(
  parentBrick: object,
  slotName: string | null,
  slotValues: Value[],
  make: ((value: ObjectValue<Value>, index: number) => ReactElement),
): ReactElement[] => {
  const { store } = useBrickContext();
  const storedParent = store.get(parentBrick);

  assert(storedParent, 'Brick should be specified');

  const previousSlotValues = useRef<object[]>([]);

  const makeRef = useRef(make);
  makeRef.current = make;

  const elements = useMemo(() => {
    let brickValuesForSlot: Record<string, object>;
    storedParent.slots = storedParent.slots || {};

    if (slotName) {
      brickValuesForSlot = {};
      storedParent.slots[slotName] = brickValuesForSlot;
    } else {
      brickValuesForSlot = storedParent.slots;
    }

    return slotValues.map((value, index) => {
      const isPrimitiveValue = isPrimitive(value);
      const previousValueItem = previousSlotValues.current[index];

      const previousValue = (
        isPrimitiveValue
          ? (previousValueItem as { value: Primitive })?.value
          : previousValueItem
      ) as Value;

      // eslint-disable-next-line no-nested-ternary -- let's keep it here
      const newValue = (value === previousValue
        ? previousValueItem
        : (isPrimitiveValue ? { value } : value)) as object;

      previousSlotValues.current[index] = newValue;

      const storedItem = store.get(newValue);
      const childPathRef = {
        current: () => [
          ...storedParent.pathRef.current(),
          ...(slotName ? [slotName] : []),
          `${index}`,
        ],
      };

      brickValuesForSlot[`${index}`] = newValue;

      if (storedItem) {
        storedItem.pathRef = childPathRef;
        return storedItem.react!;
      }

      const react = makeRef.current(newValue as ObjectValue<Value>, index);
      store.set(newValue, {
        value: newValue,
        pathRef: childPathRef,
        react,
      });

      return react;
    });
  }, [slotName, slotValues, store, storedParent]);

  return elements;
};
