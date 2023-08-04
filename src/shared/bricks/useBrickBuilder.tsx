import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { cloneElement, ReactElement, ReactNode, useMemo, useRef } from 'react';

import { array, tap } from '@/shared/operators';

import { hasCustomChildren, hasSlots, Slot } from './builder';
import { Brick, BrickValue, isBrickValue } from './utils';

let i = 0;
const newKey = () => `${++i}`;
type CacheMap = WeakMap<object, ReactElement>;

const prepareSlotForProps = (
  [slotName, bricks]: Slot,
  value: object,
) => pipe(
  R.ask<{
    cache: CacheMap;
    Component: Brick;
    parentElement?: ReactElement,
  }>(),
  R.map(({ cache, Component, parentElement }) => {
    if (slotName in value) {
      const slotValue = (value as Record<string, unknown>)[slotName];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const children = buildSlot([slotName, bricks], slotValue)({
        cache,
        parentElement,
        parentBrick: Component,
      });
      return {
        [slotName]: Array.isArray(children) && children.length
          ? children
          : null,
      };
    }

    return { [slotName]: null };
  }),
);

const buildCustomValue = (brick: Brick, value: unknown) => {
  if (hasCustomChildren(brick)) {
    return brick.customChildren.find((matcher) => matcher(value))?.(value) || null;
  }
  return null;
};

function buildSlot(
  [slotName, bricks]: Slot,
  inputValue: unknown,
) {
  let inserted = 0;
  return pipe(
    R.ask<{
      cache: CacheMap;
      parentElement?: ReactElement;
      parentBrick: Brick;
    }>(),
    R.map(({ cache, parentElement, parentBrick }): ReactElement[] | null => pipe(
      O.fromNullable(inputValue),
      O.map(array),
      O.map(A.reduceWithIndex<unknown, ReactElement[]>([], (index, acc, value) => pipe(
        value && typeof value === 'object'
          ? cache.get(value)
          : parentElement?.props[slotName]?.[index - inserted]?.props?.value === value
            ? parentElement?.props[slotName]?.[index - inserted]
            : null,
        O.fromNullable,
        O.fold(
          () => {
            const oldElementInParent: ReactElement = parentElement?.props[slotName]?.[index - inserted];
            const oldValueInParent = oldElementInParent?.props?.value;
            const oldValueInParentIsBrick = isBrickValue(oldValueInParent);

            const formattedValue: BrickValue | null = !isBrickValue(value)
              ? buildCustomValue(parentBrick, value)
              : value;

            if (!formattedValue) {
              return acc;
            }

            const { id, brick, ...rest } = formattedValue;

            return pipe(
              bricks?.[brick],
              O.fromNullable,
              O.map((Component) => pipe(
                oldValueInParentIsBrick && id === oldValueInParent?.id && oldElementInParent?.props || {},
                (props: object) => ({ ...props, ...rest, value }),
                (props) => pipe(
                  hasSlots(Component) ? Component.slots : null,
                  O.fromNullable,
                  O.map(Object.entries),
                  O.map(A.reduce({}, (slotAcc, [currentSlotName, currentSlotBricks]: Slot) => ({
                    ...slotAcc,
                    ...prepareSlotForProps(
                      [currentSlotName, currentSlotBricks ?? bricks],
                      formattedValue,
                    )({ cache, Component, parentElement: oldElementInParent }),
                  }))),
                  O.getOrElse(() => ({})),
                  (slotProps) => ({ ...props, ...slotProps }),
                ),
                (props) => pipe(
                  oldValueInParentIsBrick && id === oldValueInParent?.id,
                  O.fromPredicate(Boolean),
                  O.map(() => cloneElement(oldElementInParent, props)),
                  O.getOrElse(() => {
                    inserted += 1;
                    return <Component key={formattedValue.id ?? newKey()} {...props} />;
                  }),
                ),
                tap((element) => value && typeof value === 'object' && cache.set(value, element)),
                tap((element) => acc.push(element)),
              )),
              () => acc,
            );
          },
          (element: ReactElement) => {
            acc.push(element);
            return acc;
          },
        ),
      ))),
      O.getOrElseW(() => null),
    )),
  );
}

export const useBricksBuilder = (
  value: unknown,
  parentBrick: Brick,
): ReactNode => {
  const editorValue = useMemo(() => ({
    brick: Symbol('builder'),
  }), []);
  const cacheRef = useRef<CacheMap>(new WeakMap());

  return useMemo(
    () => pipe(
      cacheRef.current.get(editorValue),
      (parentElement) => buildSlot(
        ['children', hasSlots(parentBrick) ? parentBrick.slots.children : {}],
        value,
      )({ cache: cacheRef.current, parentElement, parentBrick }),
      tap((elements) => cacheRef.current.set(editorValue, (
        <>
          {elements}
        </>
      ))),
    ),
    [editorValue, value, parentBrick],
  );
};
