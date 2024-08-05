import { debug, tap } from '@brickifyio/operators';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import {
  cloneElement,
  createRef,
  type ReactNode,
} from 'react';

import { type Change } from '../../changes';
import {
  type BrickValue,
  type Component as ComponentType,
  isBrickValue,
  type NamedComponent,
} from '../../components';
import { hasProps, hasSlots } from '../../extensions';
import { type BrickStore, type BrickStoreValue } from '../../store';
import { type PathRef } from '../../utils';

type Dependencies = {
  store: BrickStore;
  slots: Record<string, ComponentType>;
  onChange: (...changes: Change[]) => void;
  pathRef: PathRef;
  oldValue?: BrickValue[];
};

type Data = {
  value: BrickValue;
  slotMap: Record<string, 'inherit' | Record<string, NamedComponent>>;
  change: (...changes: Change[]) => void;
  cached?: BrickStoreValue;
  cachedOutdated?: BrickStoreValue;
  pathRef: PathRef;
  node: BrickValue;
  nodeOutdated?: BrickValue;
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

export const addItemFromStore = ({ store }: PickedDeps<'store'>) =>
  <T extends PickedData<'value'>>(
    data: T,
  ) => ({
    ...data,
    cached: store.get(data.value),
  });

export const addPathRef = (deps: PickedDeps<'pathRef'>) =>
  <T extends PickedData<'index' | 'cached'>>(data: T) => {
    const pathRef = data.cached?.pathRef ?? createRef() as PathRef;

    pathRef.current = () => [...deps.pathRef.current(), `${data.index}`];

    return { ...data, pathRef };
  };

export const addChange = (deps: PickedDeps<'onChange'>) =>
  <T extends PickedData<'value' | 'pathRef'>>(data: T) => ({
    ...data,
    change: (...changes: Partial<Change>[]) => deps.onChange?.(
      ...changes.map(({ type = 'update', path, ...value }) => ({
        type,
        path: path ?? data.pathRef.current(),
        ...(
          path
            ? value
            : {
              value: { ...data.value, ...value },
            }
        ),
      })),
    ),
  });

export const addSlotsMeta = <T extends PickedData<'Component'>>(value: T) => ({
  ...value,
  slotMap: hasSlots(value.Component) ? value.Component.slots : {},
});

type AddTreeNodeData = PickedData<'value' | 'slotMap' | 'cached'>;
export const addTreeNode = <T extends AddTreeNodeData>(data: T) => ({
  ...data,
  node: (data.cached?.slotsTreeNode ?? data.value) as BrickValue,
});

type AddOutdatedDataDeps = PickedDeps<'store' | 'oldValue' | 'pathRef'>;
const addOutdatedData = (deps: AddOutdatedDataDeps) =>
  <T extends PickedData<'index' | 'pathRef'>>(data: T) => {
    const nodeOutdated = deps.oldValue?.[data.index];
    return {
      ...data,
      nodeOutdated,
      cachedOutdated: deps.store.get(nodeOutdated ?? {}),
    };
  };

export const buildSlots = (deps: Dependencies) =>
  (data: Data) =>
    Object
      .entries(data.slotMap)
      .reduce<Record<string, readonly ReactNode[]>>(
        (acc, [name, childBricks]) => {
          const childValue = data.value[name as keyof typeof data.value] as BrickValue[];
          acc[name] = objectToReact(childValue)({
            onChange: deps.onChange,
            store: deps.store,
            slots: (
              childBricks === 'inherit'
                ? deps.slots
                : childBricks
            ) as Record<string, ComponentType> || {},
            pathRef: {
              current: () => [...data.pathRef.current(), name],
            },
            oldValue: data.nodeOutdated?.[name] as BrickValue[],
          });
          return acc;
        },
        {},
      );

export const build = (deps: Dependencies) => flow(
  I.bind('slotProps', buildSlots(deps)),
  I.map(({ slotProps, Component, change, value, index, cachedOutdated }) => {
    const { id, brick: _brick, ...rest } = value;
    const key = id || `${index}`;

    const props = {
      ...(hasProps(Component) && Component.props),
      ...rest,
      ...slotProps,
      onChange: change,
      brick: value,
    };

    if (cachedOutdated && cachedOutdated?.react?.key === key) {
      return cloneElement(cachedOutdated.react, props);
    }

    return (
      <Component key={key} {...props} />
    );
  }),
);

export const objectToReact = flow(
  R.traverseArrayWithIndex<Dependencies, BrickValue, ReactNode | null>(flow(
    (index, value) => R.of({ index, value }),
    R.chain((inputData) => (deps: Dependencies) => pipe(
      inputData,
      safeValue,
      safeComponent(deps),
      O.map(flow(
        addItemFromStore(deps),
        addPathRef(deps),
        addChange(deps),
        addSlotsMeta,
        addTreeNode,
        addOutdatedData(deps),
      )),
      O.chain((data) => pipe(
        O.fromNullable(data.cached?.react),
        O.alt(flow(
          () => data,
          build(deps),
          tap((react) => {
            deps.store.set(
              data.value,
              {
                slotsTreeNode: data.node,
                pathRef: data.pathRef,
                value: data.value,
                react,
              },
            );
          }),
          O.some,
        )),
      )),
    )),
    R.map(O.getOrElseW(() => null)),
  )),
);
