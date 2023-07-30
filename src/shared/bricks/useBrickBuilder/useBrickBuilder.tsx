import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { cloneElement, ReactElement, ReactNode, useMemo } from 'react';

import { array, tap } from '@/shared/operators';

import { Cache, useCache } from './cache';
import { Brick, hasSlots, isBrickValue, isChildrenFitBrick, Slot } from '../utils';

let i = 0;
const newKey = () => `${++i}`;

const prepareSlotForProps = (
  [slotKey, bricks]: Slot,
  value: object,
  parent?: ReactElement,
  parentBricks: Record<string, Brick> = {},
) => pipe(
  R.ask<{
    cache: Cache;
  }>(),
  R.map(({ cache }) => {
    if (slotKey in value) {
      const slotValue = (value as Record<string, unknown>)[slotKey];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const children = build(slotValue, bricks ?? parentBricks)({
        cache,
        slot: parent && { element: parent, name: slotKey },
      });
      return {
        [slotKey]: Array.isArray(children) && children.length
          ? children
          : null,
      };
    }

    return { [slotKey]: null };
  }),
);

function build(
  inputValue: unknown,
  bricks: Record<string, Brick> = {},
) {
  let inserted = 0;
  return pipe(
    R.ask<{ cache: Cache; slot?: { name: string; element: ReactElement } }>(),
    R.map(({ cache, slot }): ReactElement[] | null => pipe(
      O.fromNullable(inputValue),
      O.map(array),
      O.map(A.reduceWithIndex<unknown, ReactElement[]>([], (index, acc, value) => pipe(
        O.fromNullable(value && typeof value === 'object'
          ? cache.get(value)
          : slot?.element?.props[slot.name]?.[index - inserted]?.props?.value === value
            ? slot?.element.props[slot.name]?.[index - inserted]
            : null),
        O.fold(
          () => {
            const oldElementInParent: ReactElement = slot?.element.props[slot.name]?.[index - inserted];
            const oldValueInParent = oldElementInParent?.props?.value;
            const parentIsBrick = isBrickValue(oldValueInParent);

            if (isBrickValue(value)) {
              const { id: removedId, brick: removedBrick, ...rest } = value;
              return pipe(
                bricks[value.brick],
                O.fromNullable,
                O.map((Component) => pipe(
                  parentIsBrick && value.id === oldValueInParent.id && oldElementInParent?.props || {},
                  (props) => ({ ...props, ...rest, value }),
                  (props) => pipe(
                    hasSlots(Component) ? Component.slots : null,
                    O.fromNullable,
                    O.map(Object.entries),
                    O.map(A.reduce({}, (slotAcc, currentSlot: Slot) => ({
                      ...slotAcc,
                      ...prepareSlotForProps(currentSlot, value, oldElementInParent)({ cache }),
                    }))),
                    O.getOrElse(() => ({})),
                    (slotProps) => ({ ...props, slotProps }),
                  ),
                  (props) => pipe(
                    parentIsBrick && value.id === oldValueInParent.id && cloneElement(oldElementInParent, props) || null,
                    O.fromNullable,
                    O.getOrElse(() => {
                      inserted += 1;
                      return <Component key={newKey()} {...props} />;
                    }),
                  ),
                  tap((element) => cache.add(value, element)),
                  tap((element) => acc.push(element)),
                  () => acc,
                )),
                O.getOrElseW(() => acc),
              );
            }

            const bricksArray = Object.values(bricks);
            return pipe(
              bricksArray,
              A.findFirst(isChildrenFitBrick(value)),
              O.map((ComponentNew) => {
                const ComponentOld = pipe(
                  bricksArray,
                  A.findFirst(isChildrenFitBrick(oldValueInParent)),
                  O.getOrElseW(() => null),
                );

                const currentSlot = hasSlots(ComponentNew) && ComponentNew.slots.children;
                const newProps = {
                  ...oldElementInParent?.props || {},
                  value,
                  ...currentSlot
                    ? prepareSlotForProps(['children', currentSlot], { children: value }, oldValueInParent)
                    : { children: value },
                };

                if (ComponentOld?.brick !== ComponentNew.brick) {
                  inserted += 1;
                }

                const element = ComponentOld?.brick === ComponentNew.brick
                  ? cloneElement(oldElementInParent, newProps)
                  : (
                    <ComponentNew key={newKey()} {...newProps} />
                  );

                if (value && typeof value === 'object') {
                  cache.add(value, element);
                }

                acc.push(element);
                return acc;
              }),
              O.getOrElse(() => acc),
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
  bricks: Record<string, Brick> = {},
): ReactNode => {
  const editorValue = useMemo(() => ({
    brick: Symbol('builder'),
  }), []);
  const cache = useCache();

  return useMemo(
    () => pipe(
      cache.get(editorValue),
      (element) => build(value, bricks)({
        cache,
        slot: element && { name: 'children', element },
      }),
      tap((elements) => cache.add(editorValue, (
        <>
          {elements}
        </>
      ))),
    ),
    [cache, editorValue, value, bricks],
  );
};
