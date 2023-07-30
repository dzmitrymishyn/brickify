import { capitalizeFirstLetter } from '@/shared/operators';
import { Spread } from '@/shared/utils';

import { Brick, BrickComponent, BrickName, BrickWithSlots } from './bricks';
import { formatBricksArray } from './fns';
import { BrickValue } from './values';

export const make = <Comp extends React.FC<any> & BrickName<any>, A extends object[]>(
  Component: Comp,
  ...parts: [...A]
) => {
  Component.displayName = capitalizeFirstLetter(Component?.brick || 'UnnamedBrick');

  return Object.assign(Component, Component, ...parts) as Spread<A> & Comp;
};

export const component = <Name extends string, Comp extends React.FC<any>>(
  name: Name,
  Component: Comp,
  config?: Partial<{
    parseValue(html: string): unknown;
    is(node: Node): boolean;
  }>,
): BrickComponent<Comp> & BrickName<Name> =>
    Object.assign(Component.bind(null) as Comp, {
      brick: name,
      parseValue: () => null,
      is: () => false,
    }, config || {});

export const factory = <P extends (...props: any[]) => any>(of: P) => ({ of });

export const slots = (...slotsArray: [string, Brick[]?][]): BrickWithSlots => ({
  slots: slotsArray.reduce((acc, [key, bricks]) => ({
    ...acc,
    [key]: bricks ? formatBricksArray(bricks) : null,
  }), {}),
});

export const customChildren = (...handlers: ((value: unknown) => null | BrickValue)[]) => ({
  customChildren: handlers,
});
