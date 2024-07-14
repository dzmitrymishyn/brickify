import { array, tap } from '@brickifyio/operators';
import { add, type Node, of } from '@brickifyio/utils/slots-tree';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import React, {
  cloneElement,
  createRef,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  type Component as ComponentType,
  type NamedComponent,
} from './brick';
import { type BrickValue, hasSlots, isBrickValue } from './utils';
import { type Change, type ChangeEvent } from '../core';

type PathRef = MutableRefObject<() => string[]>;

export type CacheItem = {
  element: ReactElement;
  node: Node;
  pathRef: PathRef;
};

type Dependencies = {
  onChange: (...changes: ChangeEvent[]) => void;
  cache: WeakMap<object, CacheItem>;
  slots: Record<string, ComponentType>;
  parentPathRef: PathRef;
  parent: Node;
  oldParent?: Node;
};

type Data = {
  value: BrickValue;
  slotMap: Record<string, 'inherit' | Record<string, NamedComponent>>;
  change: (...changes: Change[]) => void;
  cached?: CacheItem;
  cachedOutdated?: CacheItem;
  pathRef: PathRef;
  node: Node;
  nodeOutdated?: Node;
  Component: ComponentType;
  index: number;
};

type PickedData<Keys extends keyof Data> = Pick<Data, Keys>;
type PickedDataOption<Keys extends keyof Data> = O.Option<PickedData<Keys>>;
type PickedDeps<Keys extends keyof Dependencies> = Pick<Dependencies, Keys>;

export const safeValue = ({
  value,
  ...data
}: { index: number; value: unknown }): PickedDataOption<'index' | 'value'> => {
  if (isBrickValue(value)) {
    return O.some({ ...data, value });
  }

  return O.none;
};

export const safeComponent = ({ slots }: PickedDeps<'slots'>) =>
  <T extends PickedData<'value'>>(option: O.Option<T>) => pipe(
    option,
    O.bind('Component' as Exclude<'Component', keyof T>, flow(
      ({ value }) => slots[value.brick],
      O.fromNullable,
    )),
  );

export const addCached = ({ cache }: PickedDeps<'cache'>) =>
  <T extends PickedData<'value'>>(
    data: T,
  ) => ({
    ...data,
    cached: cache.get(data.value),
  });

export const addPathRef = ({ parentPathRef }: PickedDeps<'parentPathRef'>) =>
  <T extends PickedData<'index' | 'cached'>>(data: T) => {
    const pathRef = data.cached?.pathRef
      ?? createRef<() => string[]>() as MutableRefObject<() => string[]>;

    pathRef.current = () => [...parentPathRef.current(), `${data.index}`];

    return { ...data, pathRef };
  };

export const addChange = ({ onChange }: PickedDeps<'onChange'>) =>
  <T extends PickedData<'value' | 'pathRef'>>(data: T) => ({
    ...data,
    change: (...changes: Partial<Change>[]) => onChange(
      ...changes.map(({ type = 'update', ...value }) => ({
        type,
        value: { ...data.value, ...value },
        path: data.pathRef.current(),
      }))
    ),
  });

export const addSlotsMeta = <T extends PickedData<'Component'>>(value: T) => ({
  ...value,
  slotMap: hasSlots(value.Component) ? value.Component.slots : {},
});

type AddTreeNodeData = PickedData<'value' | 'slotMap' | 'cached'>;
export const addTreeNode = <T extends AddTreeNodeData>(data: T) => ({
  ...data,
  node: data.cached?.node ?? of(data.value, Object.keys(data.slotMap)),
});

type AddOutdatedDataDeps = PickedDeps<'cache' | 'oldParent' | 'parentPathRef'>;
const addOutdatedData = (deps: AddOutdatedDataDeps) =>
  <T extends PickedData<'index'>>(data: T) => {
    const path = deps.parentPathRef.current();
    const slotName = path?.[path?.length - 1];
    const nodeOutdated = deps.oldParent?.slots?.[slotName]?.[data.index];
    return {
      ...data,
      nodeOutdated,
      cachedOutdated: deps.cache.get(nodeOutdated?.value ?? {}),
    };
  };

export const buildSlots = (deps: Dependencies) =>
  ({ slotMap, value, node, pathRef, nodeOutdated }: Data) =>
    Object
      .entries(slotMap)
      .reduce<Record<string, readonly ReactNode[]>>(
        (acc, [name, childBricks]) => {
          const childValue = value[name as keyof typeof value];
          acc[name] = objectToReact(childValue)({
            onChange: deps.onChange,
            cache: deps.cache,
            slots: (
              childBricks === 'inherit'
                ? deps.slots
                : childBricks
            ) as Record<string, ComponentType> || {},
            parentPathRef: {
              current: () => [...pathRef.current(), name],
            },
            parent: node,
            oldParent: nodeOutdated,
          });
          return acc;
        },
        {},
      );

export const build = (deps: Dependencies) => flow(
  I.bind('slotProps', buildSlots(deps)),
  I.map(({ slotProps, Component, change, value, index, pathRef, cachedOutdated }) => {
    const { id, brick: _brick, ...rest } = value;
    const key = `${id || index}`;

    const props = {
      ...rest,
      ...slotProps,
      onChange: change,
      brick: { value, pathRef },
    };

    if (cachedOutdated && cachedOutdated?.element.key === key) {
      return cloneElement(cachedOutdated.element, props);
    }

    return (
      <Component {...props} key={id || index} />
    );
  }),
);

export const objectToReact = flow(
  array<unknown>,
  R.traverseArrayWithIndex<Dependencies, unknown, ReactNode | null>(flow(
    (index, value) => R.of({ index, value }),
    R.chain((values) => (deps: Dependencies) => pipe(
      values,
      safeValue,
      safeComponent(deps),
      O.map(flow(
        addCached(deps),
        addPathRef(deps),
        addChange(deps),
        addSlotsMeta,
        addTreeNode,
        addOutdatedData(deps),
        tap(({ node }) => add(
          deps.parent,
          deps.parentPathRef.current().at(-1)!,
          node,
        )),
      )),
      O.chain((data) => pipe(
        O.fromNullable(data.cached?.element),
        O.alt(flow(
          () => data,
          build(deps),
          tap((element) => deps.cache.set(
            data.value,
            { element, node: data.node, pathRef: data.pathRef },
          )),
          O.some,
        )),
      )),
    )),
    R.map(O.getOrElseW(() => null)),
  )),
);
