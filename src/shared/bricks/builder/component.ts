import { Brick } from '../utils';

export const component = <Name extends string, Comp extends React.FC<any>>(
  name: Name,
  Component: Comp,
  config?: Partial<{
    parseValue(html: string): unknown;
    is(node: Node): boolean;
  }>,
): Brick<Name, Comp> =>
    Object.assign(Component.bind(null) as Comp, {
      brick: name,
      parseValue: () => null,
      is: () => false,
    }, config || {});
