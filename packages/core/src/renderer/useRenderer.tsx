import { array, tap } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import { type ReactNode, useMemo, useRef } from 'react';

import { renderWithPlugins } from './utils';
import { type OnChange } from '../changes';
import { type BrickValue, type Component, getName, isBrickValue } from '../components';
import { hasProps, hasSlots } from '../extensions';
import { useBrickContext } from '../hooks';
import { type Plugin } from '../plugins';
import { type BrickStore, type BrickStoreValue } from '../store';
import { type PathRef } from '../utils';

const sanitizeBrick = (
  { id: _id, brick: _brick, ...rest }: BrickValue,
) => rest;

type Value = Record<string, unknown>;

type Deps = {
  pathRef: PathRef;
  parentRef: { current: object | null };
  onChange?: OnChange | null;
  props?: object;
  store: BrickStore;
  plugins: Record<string, Plugin>;
};

const render = (
  deps: Deps,
  slotsMeta: Record<string, Component>,
) => flow(
  O.fromPredicate(isBrickValue),
  O.bindTo('brickValue'),
  O.bind('brick', ({ brickValue }) => O.of<BrickStoreValue>({
    pathRef: deps.pathRef,
    value: brickValue,
    parentRef: deps.parentRef,
    currentRef: { current: brickValue },
    slots: {},
  })),
  O.chain(({ brickValue, brick }) => pipe(
    deps.store.get(brickValue),
    O.fromNullable,
    O.map(tap((stored) => {
      stored.pathRef.current = deps.pathRef.current;
      stored.parentRef.current = deps.parentRef.current;
      stored.currentRef.current = brickValue;
    })),
    O.chain(({ react }) => O.fromNullable(react)),
    O.alt(() => pipe(
      O.fromNullable(slotsMeta[brickValue.brick]),
      O.bindTo('Component'),
      O.bind('slots', ({ Component }) => pipe(
        Object.entries(hasSlots(Component) ? Component.slots : {}),
        A.map(([key, propertySlots]) => [
          key,
          propertySlots === 'inherit'
            ? slotsMeta
            : propertySlots
        ]),
        Object.fromEntries,
        buildSlots(
          { ...deps, parentRef: brick.currentRef },
          brickValue,
        ),
        O.some,
      )),
      O.bind('props', ({ Component, slots }) => O.fromNullable({
        ...hasProps(Component) && Component.props,
        ...sanitizeBrick(brickValue),
        ...slots,
        brick,
      })),
      O.map(({ props, Component }) => renderWithPlugins(
        deps.plugins,
        <Component
          {...props}
          key={brickValue.id ?? brick.pathRef.current().join('/')}
        />
      )),
      O.map(tap((react) => {
        brick.react = react;
      })),
    )),
  )),
  O.getOrElseW(() => null),
);

const traverseSlotValues = (
  deps: Deps,
  slotsMeta: Record<string, Component>,
) => flow(
  I.bindTo('valueOriginal'),
  I.bind('valueArray', ({ valueOriginal }) => array(valueOriginal)),
  ({ valueArray, valueOriginal }) => pipe(
    valueArray,
    A.mapWithIndex((index, value) => render(
      {
        ...deps,
        pathRef: {
          current: () => [
            ...deps.pathRef.current(),
            ...(Array.isArray(valueOriginal) ? [`${index}`] : []),
          ],
        },
      },
      slotsMeta,
    )(value)),
  ),
);

type SlotsMetaToReactNode = (
  slotsMeta: Record<string, Record<string, Component>>,
) => Record<string, ReactNode>;

const buildSlots = (
  deps: Deps,
  brickValue: Value,
): SlotsMetaToReactNode => flow(
  O.fromPredicate(flow(Object.keys, (keys) => keys.length, Boolean)),
  O.map(Object.entries<Record<string, Component>>),
  O.map(A.map(
    ([name, components]) => [
      name,
      traverseSlotValues({
        ...deps,
        pathRef: { current: () => [...deps.pathRef.current(), name] },
      }, components)(brickValue[name]),
    ] as const,
  )),
  O.map(Object.fromEntries<ReactNode>),
  O.getOrElseW(() => ({})),
);

const toSlotsMetaMap = flow(
  Object.entries<Component[]>,
  A.reduce({}, (acc, [key, components]) => ({
    ...acc,
    [key]: Object.fromEntries(components.map((component) => [
      getName(component),
      component,
    ])),
  }))
);

export type UseRendererOptions = {
  brick: BrickStoreValue;
  slotsMeta: Record<string, Component[]>;
  props?: object;
};

export const useRenderer = (options: UseRendererOptions) => {
  const { plugins, store } = useBrickContext();

  const previousValueRef = useRef<unknown>(options.brick.value);

  const results = useMemo(() => pipe(
    options.slotsMeta,
    toSlotsMetaMap,
    buildSlots({
      store,
      props: options.props,
      plugins,
      pathRef: { current: () => [] },
      parentRef: { current: options.brick.value as object },
    }, options.brick.value as Value),
    tap(() => {
      previousValueRef.current = options.brick.value;
    }),
  ), [options.brick, options.props, options.slotsMeta, plugins, store]);

  return results;
};
