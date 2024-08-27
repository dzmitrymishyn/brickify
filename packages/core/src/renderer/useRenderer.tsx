import { tap } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { renderWithPlugins } from './utils';
import { type OnChange } from '../changes';
import {
  type BrickValue,
  type Component,
  componentsToMap,
  isBrickValue,
} from '../components';
import { hasProps, hasSlots } from '../extensions';
import { useBrickContext } from '../hooks/useBrickContext';
import { type Plugin } from '../plugins';
import { type BrickStore, type BrickStoreValue } from '../store';
import { type PathRef } from '../utils';

type Deps = {
  pathRef: PathRef;
  onChange?: OnChange | null;
  oldValue?: Record<string, unknown>;
  store: BrickStore;
  componentsMap?: Record<string, Component>;
  plugins: Record<string, Plugin>;
};

const sanitizeBrick = (
  { id: _id, brick: _brick, ...rest }: BrickValue,
) => rest;

export const buildSlots = (
  deps: Deps,
  component: Component,
  brickValue: BrickValue,
) => pipe(
  component,
  O.fromPredicate(hasSlots),
  O.map(({ slots }) => Object.entries(slots)),
  O.map(A.reduce(
    {} as Record<string, ReactNode[]>,
    (acc, [name, components]) => {
      const componentsMap = components === 'inherit'
        ? deps.componentsMap
        : components;

      acc[name] = renderArray({
        ...deps,
        oldValue: deps.oldValue?.[name] as Record<string, unknown>,
        pathRef: {
          current: () => [...deps.pathRef.current(), name],
        },
        componentsMap,
      }, brickValue[name] as BrickValue[]);

      return acc;
    },
  )),
  O.getOrElseW(() => ({})),
);

const render = (deps: Deps, brickValue: BrickValue) => pipe(
  O.fromNullable(deps.componentsMap?.[brickValue.brick]),
  O.bindTo('Component'),
  O.bind('slots', ({ Component }) => O.of(
    buildSlots(deps, Component, brickValue),
  )),
  O.bind('brick', () => O.of<BrickStoreValue>({
    pathRef: deps.pathRef,
    value: brickValue,
  })),
  O.map(({ Component, slots, brick }) => pipe(
    {
      ...hasProps(Component) && Component.props,
      ...sanitizeBrick(brickValue),
      ...slots,
      ...deps.onChange && {
        onChange: deps.onChange,
      },
      brick,
    },
    (props) => {
      if (brickValue.id === deps.oldValue?.id) {
        const oldElement = deps.store
          .get(deps.oldValue!)?.react as ReactElement<object>;

        if (oldElement) {
          return cloneElement(oldElement, {
            ...oldElement.props,
            ...props,
          });
        }
      }

      return renderWithPlugins(
        deps.plugins,
        <Component {...props} key={brickValue.id} />,
      );
    },
    tap((react) => {
      brick.react = react;
    }),
  )),
);

const renderArray = (deps: Deps, values: BrickValue[]) => values.map(
  (value, index) => pipe(
    value,
    O.fromPredicate(isBrickValue),
    O.bindTo('brickValue'),
    O.bind('pathRef', () => O.of({
      current: () => [...deps.pathRef.current(), `${index}`],
    })),
    O.chain(({ pathRef, brickValue }) => pipe(
      deps.store.get(brickValue),
      O.fromNullable,
      O.map(tap((stored) => {
        stored.pathRef.current = pathRef.current;
      })),
      O.chain(({ react }) => O.fromNullable(react)),
      O.alt(() => render({
        ...deps,
        oldValue: deps.oldValue?.[index] as Record<string, unknown>,
        pathRef,
      }, brickValue)),
    )),
    O.getOrElseW(() => null),
  ),
);

export const useRenderer = (
  brick: BrickStoreValue<BrickValue | BrickValue[]>,
  value: BrickValue[],
  components: Component[],
  onChange?: OnChange | null,
): ReactNode => {
  const { store, plugins } = useBrickContext();
  const rootValueRef = useRef<Record<string, unknown> | undefined>(undefined);

  const onChangeRef = useRef<OnChange | null>();
  onChangeRef.current = onChange;

  const result = useMemo(() => pipe(
    store.get(brick.value),
    E.fromNullable('value is not registered in the store'),
    E.map((stored) => pipe(
      isBrickValue(brick) ? {
        current: () => [...stored.pathRef.current(), 'value'],
      } : stored.pathRef,
      (pathRef) => renderArray({
        plugins,
        onChange: onChangeRef.current,
        pathRef,
        oldValue: rootValueRef.current,
        store,
        componentsMap: componentsToMap(components),
      }, value),
    )),
    E.map(tap(() => {
      rootValueRef.current = value as unknown as Record<string, unknown>;
    })),
    E.foldW(Error, I.of),
  ), [brick, components, value, store, plugins]);

  if (result instanceof Error) {
    throw result;
  }

  return result;
};
