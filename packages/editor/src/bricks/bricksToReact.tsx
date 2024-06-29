import { array } from '@brickifyio/operators';
import { add, type Node, of } from '@brickifyio/utils/slots-tree';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import {
  createRef,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  type Component as ComponentType,
} from './brick';
import { type Change } from './changes';
import { type BrickValue, hasSlots, isBrickValue } from './utils';

type PathRef = MutableRefObject<() => string[]>;

export type CacheItem = {
  element: ReactElement;
  node: Node;
  pathRef: PathRef;
};

type Options = {
  onChange: (change: Change) => void;
  cache: WeakMap<object, CacheItem>;
  slots: Record<string, ComponentType>;
  parentPathRef: PathRef;
  parent: Node;
};

const preparePathRef = <T extends { index: number; cached?: CacheItem }>({
  index,
  cached,
}: T): R.Reader<Options, PathRef> =>
  ({ parentPathRef }) => {
    const pathRef = cached?.pathRef
      ?? createRef<() => string[]>() as MutableRefObject<() => string[]>;

    pathRef.current = () => [...parentPathRef.current(), `${index}`];

    return pathRef;
  };

const safeValue = ({
  value,
  ...data
}: { index: number; value: unknown }): O.Option<{ index: number; value: BrickValue }> => {
  if (isBrickValue(value)) {
    return O.some({ ...data, value });
  }

  return O.none;
};

const getCached = <T extends { value: BrickValue }>(
  { value }: T,
): R.Reader<Options, CacheItem | undefined> =>
  ({ cache }) => cache.get(value);

const createChange = <T extends { value: BrickValue; pathRef: PathRef }>({
  pathRef,
  value,
}: T): R.Reader<Options, (options: { type: Change['type'] }) => void> => ({ onChange }) =>
  ({ type, ...newValue }) => {
    onChange({
      type,
      value: newValue
        ? { ...value, ...newValue }
        : value,
      path: pathRef.current(),
    });
  };

const getComponent = <T extends { value: BrickValue }>(
  { value }: T,
): R.Reader<Options, ComponentType | undefined> => {
  return ({ slots }) => slots[value.brick];
};

export const bricksToReact = flow(
  array<unknown>,
  R.traverseArrayWithIndex<Options, unknown, ReactNode | null>(flow(
    (index, value) => R.of({ index, value }),
    R.map(safeValue),
    R.chain((option) => (deps: Options) => pipe(
      option,
      O.bind('Component', flow(getComponent, I.ap(deps), O.fromNullable)),
    )),
    R.chain((option) => (deps: Options) => pipe(
      option,
      O.bind('cached', flow(getCached, I.ap(deps), O.some)),
    )),
    R.chain((option) => (deps: Options) => pipe(
      option,
      O.bind('pathRef', flow(preparePathRef, I.ap(deps), O.some)),
    )),
    R.chain((option) => (deps: Options) => pipe(
      option,
      O.bind('change', flow(createChange, I.ap(deps), O.some)),
    )),
    R.chain((option) => ({ parentPathRef, parent, onChange, cache, slots }) => pipe(
      option,
      O.chain(({ Component, cached, value, pathRef, change, index }) => {
        const slotsMap = hasSlots(Component) ? Component.slots : {};
        const slotNames = Object.keys(slotsMap);
        const node = cached?.node ?? of(value, slotNames);

        add(parent, parentPathRef.current().at(-1)!, node);

        return pipe(
          O.fromNullable(cached?.element),
          O.altW(() => {
            const { id, brick: _brick, ...rest } = value;
            const slotProps = Object
              .entries(slotsMap)
              .reduce<Record<string, readonly ReactNode[]>>((acc, [name, childBricks]) => {
                const childValue = value[name as keyof typeof value];
                acc[name] = bricksToReact(childValue)({
                  onChange,
                  cache,
                  // eslint-disable-next-line -- TODO: Check it
                  slots: (childBricks === 'inherit' ? slots : childBricks) as any || {},
                  parentPathRef: { current: () => [...pathRef.current(), name] },
                  parent: node,
                });
                return acc;
              }, {});

            const element = (
              <Component
                {...rest}
                {...slotProps}
                {...{
                  onChange: change,
                  brick: { value, pathRef },
                }}
                key={id || index}
              />
            );

            cache.set(value, { element, node, pathRef });

            return O.some(element);
          }),
        );
      }),
    )),
    R.map(O.getOrElseW(() => null)),
  )),
);
