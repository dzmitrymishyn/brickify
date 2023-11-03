import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import {
  ReactElement,
  ReactNode,
} from 'react';

import { array } from '@/shared/operators';

import { hasCustomChildren, hasSlots, Slot } from './builder';
import { Brick, isBrickValue } from './utils';

const buildCustomValue = (brick: Brick, value: unknown) => {
  if (hasCustomChildren(brick)) {
    return brick.customChildren.find((matcher) => matcher(value))?.(value) || null;
  }
  return null;
};

export const bricksToReact = (
  cache: WeakMap<object, ReactElement>,
  parent: { Component: Brick; slot: Slot },
) => flow(
  array<unknown>,
  A.mapWithIndex(flow(
    (index, value) => ({ value, index }),
    I.bind('formattedValue', ({ value }) => (
      !isBrickValue(value)
        ? buildCustomValue(parent.Component, value)
        : value
    )),
    ({ formattedValue, index, value }) => {
      if (!formattedValue) {
        return null;
      }

      const { brick, id, ...rest } = formattedValue;
      const cachedElement = cache.get(formattedValue);

      if (cachedElement) {
        return cachedElement;
      }

      const Component = parent.slot[1]?.[brick];

      if (!Component) {
        return null;
      }

      const slots = hasSlots(Component) ? Component.slots : {};
      const slotProps = Object.entries(slots).reduce((acc, [name, slotBricks]) => {
        const childValue = (rest as any)[name];
        acc[name] = bricksToReact(cache, {
          slot: [name, slotBricks ?? parent.slot[1]],
          Component,
        })(childValue);
        return acc;
      }, {} as Record<string, ReactNode[]>);

      const component = (
        <Component {...rest} {...slotProps} brickValue={value} key={id || index} />
      );

      cache.set(formattedValue, component);

      return component;
    },
  )),
);
