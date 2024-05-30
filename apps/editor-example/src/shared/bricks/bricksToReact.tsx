import { array } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import React, {
  type ReactElement,
  type ReactNode,
} from 'react';

import { add, type Node, of } from '@/shared/utils/three';

import {
  type Component,
  type PropsWithBrick,
  type PropsWithChange,
} from './brick';
import { type Change } from './changes';
import { hasSlots, isBrickValue } from './utils';

type Options = {
  onChange: (change: Change) => void;
  // eslint-disable-next-line -- TODO: Add types
  cache: WeakMap<object, { element: ReactElement; node: any; path: { current: string[] } }>;
  slots: Record<string, Component>;
  path: () => string[];
  parent: Node;
}

export const bricksToReact = ({
  onChange,
  cache,
  slots,
  path: parentPath,
  parent,
}: Options) => flow(
  array<unknown>,
  A.mapWithIndex(flow(
    (index, value) => {
      if (!isBrickValue(value)) {
        return null;
      }

      // eslint-disable-next-line -- TODO: Add types
      const { brick, id, ...rest } = value;
      const cached = cache.get(value);
      const pathRef = cached?.path ?? { current: [] as string[] };
      pathRef.current = [`${index}`];

      const path = () => [...parentPath(), ...pathRef.current];
      // eslint-disable-next-line -- TODO: Add types
      const change = (newValue: unknown, changeProps: any) => { onChange({
        ...changeProps,
        value: newValue,
        path: path(),
      }); };

      const Comp = slots[brick] as Component<PropsWithChange & PropsWithBrick>;

      // eslint-disable-next-line -- TODO: Check it
      if (!Comp) {
        return null;
      }

      const slotsMap = hasSlots(Comp) ? Comp.slots : {};
      const slotNames = Object.keys(slotsMap);
      // eslint-disable-next-line -- TODO: Check it
      const node = cached?.node ?? of(value, slotNames);

      // eslint-disable-next-line -- TODO: Check it
      add(parent, parentPath().at(-1)!, node);

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
          path: () => [...path(), name],
          // eslint-disable-next-line -- TODO: Check it
          parent: node,
        })(childValue);
        return acc;
      }, {});

      const element = (
        <Comp
          {...rest}
          {...slotProps}
          onChange={change}
          brick={{ value, path }}
          // eslint-disable-next-line -- TODO: Check it
          key={id || index}
        />
      );

      // eslint-disable-next-line -- TODO: Check it
      cache.set(value, { element, node, path: pathRef });

      return element;
    },
  )),
);
