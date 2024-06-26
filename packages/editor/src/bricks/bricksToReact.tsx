import { array } from '@brickifyio/operators';
import { add, type Node, of } from '@brickifyio/utils/slots-tree';
import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import {
  createRef,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  type Component,
  type PropsWithBrick,
  type PropsWithChange,
} from './brick';
import { type Change } from './changes';
import { hasSlots, isBrickValue } from './utils';

export type CacheItem = {
  element: ReactElement;
  node: Node;
  pathRef: MutableRefObject<() => string[]>;
};

type Options = {
  onChange: (change: Change) => void;
  cache: WeakMap<object, CacheItem>;
  slots: Record<string, Component>;
  parentPathRef: MutableRefObject<() => string[]>;
  parent: Node;
};

export const bricksToReact = ({
  onChange,
  cache,
  slots,
  parentPathRef,
  parent,
}: Options) => flow(
  array<unknown>,
  A.mapWithIndex(flow(
    (index, value) => {
      if (!isBrickValue(value)) {
        return null;
      }

      const { brick, id, ...rest } = value;
      const cached = cache.get(value);
      const pathRef = cached?.pathRef
        ?? createRef<() => string[]>() as MutableRefObject<() => string[]>;
      pathRef.current = () => [...parentPathRef.current(), `${index}`];

      const change = ({ type, ...newValue }: { type: Change['type'] }) => {
        onChange({
          type,
          value: newValue
            ? { ...value, ...newValue }
            : value,
          path: pathRef.current(),
        });
      };

      const Comp = slots[brick] as Component<PropsWithChange & PropsWithBrick>;

      if (!Comp) {
        return null;
      }

      const slotsMap = hasSlots(Comp) ? Comp.slots : {};
      const slotNames = Object.keys(slotsMap);
      const node = cached?.node ?? of(value, slotNames);

      add(parent, parentPathRef.current().at(-1)!, node);

      if (cached) {
        return cached.element;
      }

      const slotProps = Object.entries(slotsMap).reduce<Record<string, ReactNode[]>>((acc, [name, childBricks]) => {
        const childValue = rest[name as keyof typeof rest];
        acc[name] = bricksToReact({
          onChange,
          cache,
          // eslint-disable-next-line -- TODO: Check it
          slots: (childBricks === 'inherit' ? slots : childBricks) as any || {},
          parentPathRef: { current: () => [...pathRef.current(), name] },
          parent: node,
        })(childValue);
        return acc;
      }, {});

      const element = (
        <Comp
          {...rest}
          {...slotProps}
          onChange={change}
          brick={{ value, pathRef }}
          key={id || index}
        />
      );

      cache.set(value, { element, node, pathRef });

      return element;
    },
  )),
);
