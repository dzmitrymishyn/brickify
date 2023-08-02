import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { cloneElement, ReactElement, ReactNode, useMemo, useRef } from 'react';

import { array, tap } from '@/shared/operators';

import { Brick, BrickValue, hasCustomChildren, hasSlots, isBrickValue, Slot } from './utils';

let i = 0;
const newKey = () => `${++i}`;
type CacheMap = WeakMap<object, ReactElement>;

const prepareSlotForProps = (
  [slotName, bricks]: Slot,
  value: object,
  parentElement?: ReactElement,
) => pipe(
  R.ask<{
    cache: CacheMap;
    Component: Brick;
  }>(),
  R.map(({ cache, Component }) => {
    if (slotName in value) {
      const slotValue = (value as Record<string, unknown>)[slotName];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const children = buildSlot(slotValue, [slotName, bricks])({
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

function buildSlot(
  inputValue: unknown,
  [slotName, bricks]: Slot,
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
        O.fromNullable(value && typeof value === 'object'
          ? cache.get(value)
          : parentElement?.props[slotName]?.[index - inserted]?.props?.value === value
            ? parentElement?.props[slotName]?.[index - inserted]
            : null),
        O.fold(
          () => {
            const oldElementInParent: ReactElement = parentElement?.props[slotName]?.[index - inserted];
            const oldValueInParent = oldElementInParent?.props?.value;
            const oldValueInParentIsBrick = isBrickValue(oldValueInParent);

            const formattedValue: BrickValue | null = !isBrickValue(value)
              ? (hasCustomChildren(parentBrick) && parentBrick.customChildren.find((matcher) => matcher(value))?.(value)) || null
              : value;

            if (!formattedValue) {
              return acc;
            }

            const { id: removedId, brick: removedBrick, ...rest } = formattedValue;

            return pipe(
              bricks?.[removedBrick],
              O.fromNullable,
              O.map((Component) => pipe(
                oldValueInParentIsBrick && removedId === oldValueInParent?.id && oldElementInParent?.props || {},
                (props) => ({ ...props, ...rest, value }),
                (props) => pipe(
                  hasSlots(Component) ? Component.slots : null,
                  O.fromNullable,
                  O.map(Object.entries),
                  O.map(A.reduce({}, (slotAcc, [currentSlotName, currentSlotBricks]: Slot) => ({
                    ...slotAcc,
                    ...prepareSlotForProps(
                      [currentSlotName, currentSlotBricks ?? bricks],
                      formattedValue,
                      oldElementInParent,
                    )({ cache, Component }),
                  }))),
                  O.getOrElse(() => ({})),
                  (slotProps) => ({ ...props, ...slotProps }),
                ),
                (props) => pipe(
                  oldValueInParentIsBrick && removedId === oldValueInParent?.id && cloneElement(oldElementInParent, props) || null,
                  O.fromNullable,
                  O.getOrElse(() => {
                    inserted += 1;
                    return <Component key={newKey()} {...props} />;
                  }),
                ),
                tap((element) => cache.set(formattedValue, element)),
                tap((element) => acc.push(element)),
                () => acc,
              )),
              O.getOrElseW(() => acc),
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
        value,
        ['children', hasSlots(parentBrick) ? parentBrick.slots.children : {}],
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
