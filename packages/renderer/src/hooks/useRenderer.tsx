import { array, tap } from '@brickifyio/operators';
import { curry } from '@brickifyio/utils/functions';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { type BrickValue, isBrickValue } from '../bricks';
import { type Component } from '../components';
import { useRendererContext } from '../context';
import { applySlots, hasProps, hasSlots } from '../extensions';
import { type PluginMap, renderWithPlugins } from '../plugins';
import { type RendererStore, type RendererStoreValue } from '../store';
import { makeRef, type PathRef } from '../utils';

const sanitizeBrick = (
  { id: _id, brick: _brick, ...rest }: BrickValue,
) => rest;

type Value = Record<string, unknown>;

type Options = {
  pathRef: PathRef;
  store: RendererStore;
  render?: (
    value: unknown, options: Omit<Options, 'render'>
  ) => ReactElement | null;
  plugins: PluginMap;
  previousValue?: unknown;
  components: Record<string, Component>;
};

const renderBrickValue = curry(
  (options: Options, value: BrickValue): O.Option<ReactElement> => {
    const stored: RendererStoreValue = {
      pathRef: options.pathRef,
      value,
      components: options.components,
      name: value.brick,
    };

    return pipe(
      O.fromNullable(options.components[value.brick]),
      O.bindTo('Component'),
      O.bind('slots', ({ Component }) => pipe(
        Object.entries(hasSlots(Component) ? Component.slots : {}),
        A.map(([key, propertySlots]) => [
          key,
          applySlots(propertySlots, options.components),
        ]),
        Object.fromEntries,
        buildSlots(options, value),
        O.some,
      )),
      O.bind('props', ({ Component, slots }) => O.fromNullable({
        ...sanitizeBrick(value),
        ...hasProps(Component) && Component.props,
        ...slots,
        stored,
      })),
      O.map(({ props, Component }) => {
        const oldReact = options.store.get(options.previousValue)
          ?.reactWithoutPlugins;
        const key = value.id ?? stored.pathRef.current().join('/');

        const reactWithoutPlugins = oldReact && key === oldReact.key
          ? cloneElement(oldReact, props)
          : <Component
              {...props}
              key={key}
            />;

        stored.reactWithoutPlugins = reactWithoutPlugins;

        return reactWithoutPlugins;
      }),
      O.map(renderWithPlugins(options.plugins)),
      O.map(tap((react) => {
        stored.react = react;
      })),
    );
  },
);

const renderUnknownValue = curry(
  (options: Options, value: unknown) => O.fromNullable(
    options.render?.(value, options),
  ),
);

const render = curry((options: Options, value: unknown): ReactNode => pipe(
  options.store.get(value),
  O.fromNullable,
  O.map(tap((oldStored) => {
    oldStored.pathRef.current = options.pathRef.current;
  })),
  O.chain(({ react }) => O.fromNullable(react)),
  O.altW(() => pipe(
    value,
    E.fromPredicate(isBrickValue, I.of),
    E.foldW(
      renderUnknownValue(options),
      renderBrickValue({ ...options, render: undefined }),
    ),
  )),
  O.getOrElseW(() => null),
));

const traverseSlotValues = (options: Options) => flow(
  I.bindTo('valueOriginal'),
  I.bind('valueArray', ({ valueOriginal }) => array(valueOriginal)),
  ({ valueArray, valueOriginal }) => pipe(
    valueArray,
    A.mapWithIndex((index, value) => render({
      ...options,
      previousValue: Array.isArray(valueOriginal)
        ? (options.previousValue as unknown[])?.[index]
        : options.previousValue,
      pathRef: makeRef(() => [
        ...options.pathRef.current(),
        ...(Array.isArray(valueOriginal) ? [`${index}`] : []),
      ]),
    })(value)),
  ),
);

type SlotsMetaToReactNode = (
  slotsMeta: Record<string, Record<string, Component>>,
) => Record<string, ReactNode>;

const buildSlots = (
  options: Options,
  value: Value,
): SlotsMetaToReactNode => flow(
  O.fromPredicate(flow(Object.keys, (keys) => keys.length, Boolean)),
  O.map(Object.entries<Record<string, Component>>),
  O.map(A.map(
    ([name, components]) => [
      name,
      traverseSlotValues(
        {
          ...options,
          previousValue: (options.previousValue as Record<string, unknown>)
            ?.[name],
          components,
          pathRef: makeRef(() => [...options.pathRef.current(), name]),
        },
      )(value[name]),
    ] as const,
  )),
  O.map(Object.fromEntries<ReactNode>),
  O.getOrElseW(() => ({})),
);

export type UseRendererOptions = {
  value: unknown;
  components?: Record<string, Component>;
  pathPrefix?: () => string[];
  render?: Options['render'];
};

export const useRenderer = ({
  value,
  components = {},
  pathPrefix = () => [],
  render: renderProp,
}: UseRendererOptions) => {
  const { plugins, store } = useRendererContext();
  const valueRef = useRef<unknown>(undefined);

  const res = useMemo(() => pipe(
    value,
    traverseSlotValues({
      store,
      plugins,
      components,
      pathRef: makeRef(pathPrefix),
      previousValue: valueRef.current,
      render: renderProp,
    }),
  ), [value, components, pathPrefix, plugins, store, renderProp]);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [res, value]);


  return res;
};
