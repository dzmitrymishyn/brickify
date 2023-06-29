import { capitalizeFirstLetter } from '@/shared/operators';
import { Spread } from '@/shared/utils';

import { Brick, BrickComponent } from './bricks';

export const brick = <Comp extends React.FC<any> & Brick<any>, A extends object[]>(
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
): BrickComponent<Comp> & Brick<Name> =>
    Object.assign(Component.bind(null) as Comp, {
      brick: name,
      parseValue: () => null,
      is: () => false,
    }, config || {});

export const factory = <P extends (...props: any[]) => any>(of: P) => ({ of });
