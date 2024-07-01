import { array, tap } from '@brickifyio/operators';
import { add, type Node, of } from '@brickifyio/utils/slots-tree';
import { flow, pipe } from 'fp-ts/lib/function';
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

export const safeValue = ({
  value,
  ...data
}: { index: number; value: unknown }): O.Option<{ index: number; value: BrickValue }> => {
  if (isBrickValue(value)) {
    return O.some({ ...data, value });
  }

  return O.none;
};

export const safeComponent = ({ slots }: Pick<Options, 'slots'>) =>
  <T extends { value: BrickValue }>(option: O.Option<T>) => pipe(
    option,
    O.bind('Component' as Exclude<"Component", keyof T>, flow(
      ({ value }) => slots[value.brick],
      O.fromNullable,
    )),
  );

export const addCached = ({ cache }: Pick<Options, 'cache'>) => <T extends { value: BrickValue }>(
  data: T,
) => ({
  ...data,
  cached: cache.get(data.value),
});

const addPathRef = ({ parentPathRef }: Pick<Options, 'parentPathRef'>) =>
  <T extends { index: number; cached?: CacheItem }>(data: T) => {
    const pathRef = data.cached?.pathRef
      ?? createRef<() => string[]>() as MutableRefObject<() => string[]>;

    pathRef.current = () => [...parentPathRef.current(), `${data.index}`];

    return { ...data, pathRef };
  };

const addChange = ({ onChange }: Pick<Options, 'onChange'>) =>
  <T extends { value: BrickValue; pathRef: PathRef }>(data: T) => ({
    ...data,
    change: ({ type, ...newValue }: { type: Change['type'] }) => onChange({
      type,
      value: newValue
        ? { ...data.value, ...newValue }
        : data.value,
      path: data.pathRef.current(),
    }),
  });

export const addSlotsMeta = <T extends { Component: ComponentType }>(value: T) => {
  const slotMap = hasSlots(value.Component) ? value.Component.slots : {};
  return {
    ...value,
    slotMap,
    slotNames: Object.keys(slotMap),
  };
};

export const addTreeNode = <T extends { value: BrickValue; slotNames: string[]; cached?: CacheItem }>(data: T) => ({
  ...data,
  node: data.cached?.node ?? of(data.value, data.slotNames),
});

export const bricksToReact = flow(
  array<unknown>,
  R.traverseArrayWithIndex<Options, unknown, ReactNode | null>(flow(
    (index, value) => R.of({ index, value }),
    R.chain((values) => (deps: Options) => pipe(
      values,
      safeValue,
      safeComponent(deps),
      O.map(addCached(deps)),
      O.map(addPathRef(deps)),
      O.map(addChange(deps)),
      O.map(addSlotsMeta),
      O.map(addTreeNode),
      O.map(tap(({ node }) => add(deps.parent, deps.parentPathRef.current().at(-1)!, node))),
      O.chain(({ node, change, index, Component, cached, pathRef, value, slotMap }) => pipe(
        O.fromNullable(cached?.element),
        O.altW(() => {
          const { id, brick: _brick, ...rest } = value;
          const slotProps = Object
            .entries(slotMap)
            .reduce<Record<string, readonly ReactNode[]>>((acc, [name, childBricks]) => {
              const childValue = value[name as keyof typeof value];
              acc[name] = bricksToReact(childValue)({
                onChange: deps.onChange,
                cache: deps.cache,
                // eslint-disable-next-line -- TODO: Check it
                slots: (childBricks === 'inherit' ? deps.slots : childBricks) as any || {},
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

          deps.cache.set(value, { element, node, pathRef });

          return O.some(element);
        }),
      )),
    )),
    R.map(O.getOrElseW(() => null)),
  )),
);
