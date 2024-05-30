import { array } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import React, {
  ReactElement,
  ReactNode,
} from 'react';

import { add, Node, of } from '@/shared/utils/three';

import {
  Component,
  PropsWithBrick,
  PropsWithChange,
} from './brick';
import { Change } from './changes';
import { hasSlots, isBrickValue } from './utils';

type Options = {
  onChange(change: Change): void;
  cache: WeakMap<object, { element: ReactElement; node: any; path: { current: string[] } }>;
  slots: Record<string, Component>;
  path(): string[];
  parent: Node;
};

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

      const { brick, id, ...rest } = value;
      const cached = cache.get(value);
      const pathRef = cached?.path ?? { current: [] as string[] };
      pathRef.current = [`${index}`];

      const path = () => [...parentPath(), ...pathRef.current];
      const change = (newValue: unknown, changeProps: any) => onChange({
        ...changeProps,
        value: newValue,
        path: path(),
      } as any);

      const Comp = slots?.[brick] as Component<PropsWithChange & PropsWithBrick>;

      if (!Comp) {
        return null;
      }

      const slotsMap = hasSlots(Comp) ? Comp.slots : {};
      const slotNames = Object.keys(slotsMap);
      const node = cached?.node ?? of(value, slotNames);

      add(parent, parentPath().at(-1)!, node);

      if (cached) {
        return cached.element;
      }

      const slotProps = Object.entries(slotsMap).reduce((acc, [name, childBricks]) => {
        const childValue = rest[name as keyof typeof rest];
        acc[name] = bricksToReact({
          onChange,
          cache,
          slots: (childBricks === 'inherit' ? slots : childBricks) as any || {},
          path: () => [...path(), name],
          parent: node,
        })(childValue);
        return acc;
      }, {} as Record<string, ReactNode[]>);

      const element = (
        <Comp
          {...rest}
          {...slotProps}
          onChange={change}
          brick={{ value, path }}
          key={id || index}
        />
      );

      cache.set(value, { element, node, path: pathRef });

      return element;
    },
  )),
);
