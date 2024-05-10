import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import {
  ReactElement,
  ReactNode,
} from 'react';

import { array } from '@/shared/operators';

import { Brick } from './brick';
import { hasSlots, isBrickValue } from './utils';

export const bricksToReact = (
  cache: WeakMap<object, ReactElement>,
  slot: [string, Record<string, Brick>],
) => flow(
  array<unknown>,
  A.mapWithIndex(flow(
    (index, value) => {
      if (!isBrickValue(value)) {
        return null;
      }

      const { brick, id, ...rest } = value;
      const cachedElement = cache.get(value);

      if (cachedElement) {
        return cachedElement;
      }

      const Component = slot[1]?.[brick];

      if (!Component) {
        return null;
      }

      const slots = hasSlots(Component) ? Component.slots : {};
      const slotProps = Object.entries(slots).reduce((acc, [name, slotBricks]) => {
        const childValue = rest[name as keyof typeof rest];
        acc[name] = bricksToReact(
          cache,
          [name, (slotBricks === 'inherit' ? slot[1] : slotBricks) || {}],
        )(childValue);
        return acc;
      }, {} as Record<string, ReactNode[]>);

      const component = (
        <Component
          {...rest}
          {...slotProps}
          brickValue={value}
          key={id || index}
        />
      );

      cache.set(value, component);

      return component;
    },
  )),
);
