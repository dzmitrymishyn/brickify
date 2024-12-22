import { array, tap } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import { cloneElement, type ReactNode, useMemo, useRef } from 'react';

import { type BrickValue, isBrickValue } from '../bricks';
import { type Component, componentsToMap } from '../components';
import { useRendererContext } from '../context';
import { hasProps, hasSlots } from '../extensions';
import { type PluginMap, renderWithPlugins } from '../plugins';
import { type RendererStore, type RendererStoreValue } from '../store';
import { makeRef, type PathRef } from '../utils';

const sanitizeBrick = (
  { id: _id, brick: _brick, ...rest }: BrickValue,
) => rest;

type Value = Record<string, unknown>;

type Deps = {
  pathRef: PathRef;
  props?: object;
  store: RendererStore;
  plugins: PluginMap;
};

const render = (
  deps: Deps,
  slotsMeta: Record<string, Component>,
  previousBrickValue?: Record<string, unknown>,
) => flow(
  O.fromPredicate(isBrickValue),
  O.bindTo('brickValue'),
  O.bind('stored', ({ brickValue }) => O.of<RendererStoreValue>({
    pathRef: deps.pathRef,
    value: brickValue,
  })),
  O.chain(({ brickValue, stored }) => pipe(
    deps.store.get(brickValue),
    O.fromNullable,
    O.map(tap((oldStored) => {
      oldStored.pathRef.current = deps.pathRef.current;
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
          deps,
          brickValue,
        ),
        O.some,
      )),
      O.bind('props', ({ Component, slots }) => O.fromNullable({
        ...hasProps(Component) && Component.props,
        ...sanitizeBrick(brickValue),
        ...slots,
        stored,
      })),
      // O.map(tap(debug)),
      O.map(({ props, Component }) => {
        const react = deps.store.get(previousBrickValue ?? {})?.react;
        const key = brickValue.id ?? stored.pathRef.current().join('/');
        return react && key === react.key
          ? renderWithPlugins(
            deps.plugins,
            cloneElement(react, props),
          )
          : renderWithPlugins(
            deps.plugins,
            <Component
              {...props}
              key={key}
            />
          );
      }),
      O.map(tap((react) => {
        stored.react = react;
      })),
    )),
  )),
  O.getOrElseW(() => null),
);

const traverseSlotValues = (
  deps: Deps,
  slotsMeta: Record<string, Component>,
  previousValue?: Record<string, unknown>,
) => flow(
  I.bindTo('valueOriginal'),
  I.bind('valueArray', ({ valueOriginal }) => array(valueOriginal)),
  ({ valueArray, valueOriginal }) => pipe(
    valueArray,
    A.mapWithIndex((index, value) => render(
      {
        ...deps,
        pathRef: makeRef(() => [
          ...deps.pathRef.current(),
          ...(Array.isArray(valueOriginal) ? [`${index}`] : []),
        ]),
      },
      slotsMeta,
      previousValue?.[index] as Record<string, unknown>,
    )(value)),
  ),
);

type SlotsMetaToReactNode = (
  slotsMeta: Record<string, Record<string, Component>>,
) => Record<string, ReactNode>;

const buildSlots = (
  deps: Deps,
  brickValue: Value,
  previousBrickValue?: Record<string, unknown>,
): SlotsMetaToReactNode => flow(
  O.fromPredicate(flow(Object.keys, (keys) => keys.length, Boolean)),
  O.map(Object.entries<Record<string, Component>>),
  O.map(A.map(
    ([name, components]) => [
      name,
      traverseSlotValues(
        {
          ...deps,
          pathRef: makeRef(() => [...deps.pathRef.current(), name]),
        },
        components,
        previousBrickValue?.[name] as Record<string, unknown>,
      )(brickValue[name]),
    ] as const,
  )),
  O.map(Object.fromEntries<ReactNode>),
  O.getOrElseW(() => ({})),
);

const toSlotsMetaMap = flow(
  Object.entries<Component[]>,
  A.map(([key, components]) => [key, componentsToMap(components)]),
  Object.fromEntries,
);

export type UseRendererOptions = {
  slotsValue: Record<string, unknown>;
  slotsMeta: Record<string, Component[]>;
  props?: object;
};

export const useRenderer = ({
  slotsValue,
  slotsMeta,
  props,
}: UseRendererOptions) => {
  const { plugins, store } = useRendererContext();
  const valueRef = useRef<Record<string, unknown>>(undefined);

  return useMemo(() => pipe(
    slotsMeta,
    toSlotsMetaMap,
    buildSlots({
      store,
      props,
      plugins,
      pathRef: makeRef(() => []),
    }, slotsValue as Value, valueRef.current),
    tap(() => {
      valueRef.current = slotsValue;
    }),
  ), [slotsValue, props, slotsMeta, plugins, store]);
};
