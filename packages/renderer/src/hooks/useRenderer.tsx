import { array, tap } from '@brickifyio/operators';
import { type Change } from '@brickifyio/utils/object';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
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

type RenderChangeType = Change['type'] | 'untouched' | 'unknown';

type OneOrMany<T> = T | T[];

type Diff = {
  redo: OneOrMany<Change>;
  undo: OneOrMany<Change>;
};

const sanitize = (
  { ...rest }: BrickValue,
  fieldsToRemove: string[] = [],
) => {
  if (!fieldsToRemove?.length) {
    return rest;
  }

  for (const key of fieldsToRemove) {
    Reflect.deleteProperty(rest, key);
  }

  return rest;
};

type Options = {
  pathRef: PathRef;
  store: RendererStore;
  render?: (
    value: unknown,
    options: Omit<Options, 'render'> & { stored?: RendererStoreValue },
  ) => ReactElement | null;
  plugins: PluginMap;
  components: Record<string, Component>;
  canMutate: <T = unknown>(
    previous: { value?: T; path?: string[] },
    next: { value: T; path: string[] },
  ) => boolean;
  getUid: (value: unknown, options: Options) => string;
};

const canMutateDefault: Options['canMutate'] = (previous, next) => {
  if (isBrickValue(next?.value)) {
    return isBrickValue(previous?.value)
      && previous.value.id === next.value.id;
  }

  return typeof previous?.value === typeof next?.value;
};

const getUidDefault: Options['getUid'] = (value, { pathRef }) => {
  if (isBrickValue(value) && value.id) {
    return `${value.id}`;
  }

  return pathRef.current().join('/');
};

const combineDiffs = (...diffs: (Diff | null | undefined)[]): Diff => {
  return diffs.reduce<{ redo: Change[]; undo: Change[] }>((acc, diff) => {
    if (diff) {
      acc.redo.push(...array(diff.redo));
      acc.undo.push(...array(diff.undo));
    }
    return acc;
  }, { redo: [], undo: [] });
};

const makeOppositChangeType = (type: Change['type']) => {
  switch (type) {
    case 'add': return 'remove';
    case 'remove': return 'add';
    case 'update': return 'update';
  }
};

const makeOppositChange = (
  type: Change['type'],
  oldValue: unknown,
  newPath: string[],
): Change => ({
  type: makeOppositChangeType(type),
  value: oldValue,
  path: newPath,
});

const makeDiffChange = (
  type: RenderChangeType,
  previous: { value: unknown; path: string[] },
  next: { value: unknown; path: string[] },
): Diff => {
  if (type === 'untouched' || type === 'unknown') {
    return { undo: [], redo: [] };
  }

  return {
    redo: {
      type,
      value: next.value,
      path: previous.path,
    },
    undo: makeOppositChange(type, previous.value, next.path),
  };
};

type SlotsMetaToReactNode = (
  slotsMeta: Record<string, Record<string, Component>>,
) => [Record<string, ReactElement[]>, Diff?];

const buildSlots = (
  options: Options & { parentStored: RendererStoreValue },
  value: Record<string, unknown>,
): SlotsMetaToReactNode => flow(
  O.fromPredicate(flow(Object.keys, (keys) => keys.length, Boolean)),
  O.map(Object.entries<Record<string, Component>>),
  O.map(A.reduce(
    [{}, { undo: [], redo: [] }] as ReturnType<SlotsMetaToReactNode>,
    ([accProps, accDiff], [name, components]) => {
      accProps[name] = accProps[name] ?? [];

      const [elements, nextStored, diff] = traverseSlotValues(
        {
          ...options,
          previousStored: options.parentStored?.slots?.[name],
          components,
          pathRef: makeRef(() => [...options.pathRef.current(), name]),
        },
        value[name],
      );

      accProps[name] = elements;

      options.parentStored.slots = options.parentStored.slots || {};

      if (options.parentStored.slots) {
        if (nextStored) {
          options.parentStored.slots[name] = nextStored;
        } else {
          Reflect.deleteProperty(options.parentStored.slots, name);
        }
      }

      return [
        accProps,
        combineDiffs(accDiff, diff),
      ] as ReturnType<SlotsMetaToReactNode>;
    },
  )),
  O.getOrElseW((): ReturnType<SlotsMetaToReactNode> => [{}]),
);

const renderBrickValue = (
  options: Options,
  nextStored: RendererStoreValue<BrickValue>,
): O.Option<[ReactElement, Diff?, RenderChangeType?]> => pipe(
  O.fromNullable(options.components[nextStored.value.brick]),
  O.bindTo('Component'),
  O.bind('slots', ({ Component }) => pipe(
    Object.entries(hasSlots(Component) ? Component.slots : {}),
    A.map(([key, propertySlots]) => [
      key,
      applySlots(propertySlots, options.components),
    ]),
    Object.fromEntries,
    buildSlots({ ...options, parentStored: nextStored }, nextStored.value),
    O.some,
  )),
  O.map(({ slots: [slotsProps, slotsDiff], Component }) => {
    const props = {
      ...sanitize(nextStored.value, ['id', 'brick']),
      ...hasProps(Component) && Component.props,
      ...slotsProps,
      stored: nextStored,
    };

    const reactWithoutPlugins = (
      <Component
        {...props}
        key={options.getUid(nextStored.value, options)}
      />
    );

    return [reactWithoutPlugins, slotsDiff];
  }),
);

const renderUnknownValue = (
  options: Options,
  stored: RendererStoreValue,
): O.Option<[ReactElement, Diff?]> => pipe(
  options.render?.(stored.value, { ...options, stored }),
  O.fromNullable,
  O.map((react) => [react]),
);

const render = (
  options: Options & { previousStored?: RendererStoreValue | null },
  value: unknown,
): [RenderChangeType, RendererStoreValue?, Diff?] => pipe(
  value === options.previousStored?.value
    ? options.previousStored
    : options.store.get(value),
  O.fromPredicate((stored): stored is RendererStoreValue => Boolean(
    stored?.react,
  )),
  O.map((stored) => ({ ...stored, pathRef: stored.pathRef })),
  O.map((stored): [RenderChangeType, RendererStoreValue] => {
    const previousPath = stored.pathRef.current();
    const previousParentPath = previousPath.slice(0, -1).join('/');

    const nextPath = options.pathRef.current();
    const nextParentPath = nextPath.slice(0, -1).join('/');

    const sameParent = nextParentPath === previousParentPath;
    const samePath = previousPath.join('/') === nextPath.join('/');

    if (!samePath) {
      options.store.mutateAfterRender(stored.value, (nextStored) => {
        nextStored.pathRef.current = options.pathRef.current;
        return nextStored;
      });
    }

    return [
      sameParent ? 'untouched' : 'add',
      stored,
    ];
  }),
  O.altW(() => pipe(
    { value },
    I.bind('canMutate', () => options.canMutate(
      {
        value: options.previousStored?.value,
        path: options.previousStored?.pathRef?.current(),
      },
      { value, path: options.pathRef.current() },
    )),
    I.bind('nextStored', ({ canMutate }) => canMutate && options.previousStored
      ? { ...options.previousStored, pathRef: options.previousStored.pathRef }
      : { pathRef: options.pathRef, value } as RendererStoreValue),
    tap(({ nextStored }) => Object.assign(nextStored, {
      value,
      components: options.components,
      name: isBrickValue(value) ? value.brick : undefined,
    })),
    tap(({ nextStored, canMutate }) => {
      const storedPath = nextStored.pathRef.current().join('/');
      const nextPath = options.pathRef.current().join('/');
      if (canMutate && storedPath !== nextPath) {
        options.store.mutateAfterRender(nextStored.value, (stored) => {
          stored.pathRef.current = options.pathRef.current;
          return stored;
        });
      }
    }),
    ({ nextStored, canMutate }) => pipe(
      isBrickValue(nextStored.value)
        ? renderBrickValue(options, nextStored)
        : renderUnknownValue(options, nextStored),
      O.map(([react, diff]): [ReactElement, Diff?] => {
        const previousReact = options.previousStored?.reactWithoutPlugins;
        return [
          previousReact && canMutate
            ? cloneElement(previousReact, react.props as object)
            : react,
          diff,
        ];
      }),
      O.map(tap(([react]) => {
        nextStored.reactWithoutPlugins = react;
      })),
      O.map(([react, diff]) => [
        renderWithPlugins(options.plugins, react),
        diff,
      ] as const),
      O.map(tap(([react]) => {
        nextStored.react = react;
      })),
      O.map(([_, diff]): [RenderChangeType, RendererStoreValue?, Diff?] => [
        canMutate ? 'update' : 'add',
        nextStored,
        diff,
      ]),
    ),
  )),
  O.getOrElseW(
    (): [RenderChangeType, RendererStoreValue?, Diff?] => ['unknown'],
  ),
);

const traverseArray = (
  options: Options & { previousStored: (RendererStoreValue | null)[] },
) => (value: unknown[]): [
  ReactElement[],
  OneOrMany<RendererStoreValue | null>?,
  Diff?
] => {
  const nextElements: ReactElement[] = [];
  const nextStoredArray: (RendererStoreValue | null)[] = [];
  let resultDiff: Diff = { redo: [], undo: [] };
  const diffMap = new Map<unknown, Diff>();
  let previousIndex = 0;

  for (let index = 0; index < value.length; index += 1) {
    const nextValue: unknown = value[index];
    const objectValue = typeof nextValue === 'object' && nextValue
      ? nextValue
      : {};
    const previousStored = options.previousStored[index];
    const previousValue: unknown = previousStored?.value;
    const nextPath = [...options.pathRef.current(), `${index}`];
    const p = previousIndex;
    const previousPath = () =>
      [...options.pathRef.current(), `${p}`];

    const [changeType, nextStored, diff] = render({
      ...options,
      previousStored,
      pathRef: makeRef(() => [...options.pathRef.current(), `${index}`]),
    }, nextValue);

    nextStoredArray.push(nextStored ?? null);

    if (!nextStored?.react) {
      if (previousIndex < options.previousStored.length) {
        previousIndex += 1;
      }
      continue;
    }

    if (changeType === 'add') {
      diffMap.set(objectValue, makeDiffChange(
        changeType,
        { path: previousPath(), value: previousValue },
        { path: nextPath, value: nextValue },
      ));

      if (previousIndex < options.previousStored.length) {
        previousIndex -= 1;
      }
    } else if (changeType === 'untouched') {
      const valueFromDiffMap = diffMap.get(nextValue);
      const isRemoved = Array.isArray(valueFromDiffMap?.redo)
        ? valueFromDiffMap?.redo?.[0]?.type === 'remove'
        : valueFromDiffMap?.redo?.type === 'remove';
      const removedItem = isRemoved ? valueFromDiffMap : null;

      while (
        !removedItem
        && nextValue !== options.previousStored[previousIndex]?.value
        && previousIndex < options.previousStored.length
      ) {
        const val: unknown = options.previousStored[previousIndex]?.value;
        diffMap.set(objectValue, makeDiffChange(
          'remove',
          { value: val, path: previousPath() },
          { value: undefined, path: nextPath },
        ));

        previousIndex += 1;
      }

      if (removedItem) {
        diffMap.set(objectValue, makeDiffChange(
          'add',
          { path: previousPath(), value: undefined },
          { path: nextPath, value: nextValue },
        ));
        if (previousIndex < options.previousStored.length) {
          previousIndex -= 1;
        }
      }
    } else if (changeType === 'update') {
      diffMap.set(objectValue, makeDiffChange(
        'update',
        { value: previousValue, path: previousPath() },
        { value: nextValue, path: nextPath },
      ));
    }

    nextElements.push(nextStored.react);
    resultDiff = combineDiffs(resultDiff, diff);

    if (previousIndex < options.previousStored.length) {
      previousIndex += 1;
    }
  }

  while (previousIndex < options.previousStored.length) {
    const val: unknown = options.previousStored[previousIndex]?.value;
    const objectValue = typeof val === 'object' && val
      ? val
      : {};
    diffMap.set(objectValue, makeDiffChange(
      'remove',
      {
        value: undefined,
        path: [...options.pathRef.current(), `${previousIndex}`] },
      {
        value: val,
        path: [...options.pathRef.current(), `${nextStoredArray.length}`],
      },
    ));

    previousIndex += 1;
  }

  resultDiff = combineDiffs(resultDiff, ...Array.from(diffMap.values()));

  return [nextElements, nextStoredArray, resultDiff];
};

const traverseSingleItem = (
  options: Options & { previousStored?: RendererStoreValue | null },
) => (value: unknown):[
  ReactElement[],
  OneOrMany<RendererStoreValue | null>?,
  Diff?
] => {
  const { previousStored, pathRef } = options;
  const [changeType, nextStored, diff] = render(
    { ...options, previousStored },
    value,
  );

  return [
    nextStored?.react ? [nextStored.react] : [],
    nextStored,
    combineDiffs(diff, makeDiffChange(
      changeType,
      {
        value: previousStored?.value,
        path: previousStored?.pathRef?.current() ?? [],
      },
      { value, path: pathRef.current() },
    )),
  ];
};

const traverseSlotValues = (
  options: Options & { previousStored?: OneOrMany<RendererStoreValue | null> },
  value: unknown,
): [
  ReactElement[],
  OneOrMany<RendererStoreValue | null>?,
  Diff?,
] => pipe(
  value,
  E.fromPredicate(Array.isArray, I.of),
  E.fold(
    traverseSingleItem({
      ...options,
      previousStored: !Array.isArray(options.previousStored)
        ? options.previousStored
        : undefined,
    }),
    traverseArray({
      ...options,
      previousStored: (
        (Array.isArray(options.previousStored) && options.previousStored)
        || []
      )
    }),
  ),
);

export type UseRendererOptions = {
  value: unknown;
  components?: Record<string, Component>;
  pathPrefix?: () => string[];
  render?: Options['render'];
  canMutate?: Options['canMutate'];
  getUid?: Options['getUid'];
};

export const useRenderer = ({
  value,
  components = {},
  pathPrefix = () => [],
  render: renderProp,
  canMutate = canMutateDefault,
  getUid = getUidDefault,
}: UseRendererOptions): [ReactElement[], Diff?] => {
  const { plugins, store } = useRendererContext();
  const previousTreeRef = useRef<OneOrMany<RendererStoreValue | null>>([]);

  const [elements, previousTree, diff] = useMemo(
    () => traverseSlotValues({
      store,
      plugins,
      components,
      pathRef: makeRef(pathPrefix),
      previousStored: previousTreeRef.current,
      render: renderProp,
      canMutate,
      getUid,
    }, value),
    [
      value,
      components,
      pathPrefix,
      plugins,
      store,
      renderProp,
      canMutate,
      getUid,
    ],
  );

  useLayoutEffect(() => {
    previousTreeRef.current = previousTree ?? [];
  }, [previousTree]);

  return [elements, diff];
};
