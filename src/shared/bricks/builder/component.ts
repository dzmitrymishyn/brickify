import { Node as DomHandlerNode } from 'domhandler';

import { capitalizeFirstLetter } from '@/shared/operators';

import { Brick } from '../utils';

export const component = <Name extends string, Comp extends React.FC<any>>(
  name: Name,
  Component: Comp,
  config?: Partial<{
    parseValue(html: string): unknown;
    is(node: Node | DomHandlerNode): boolean;
  }>,
): Brick<Name, Comp> => {
  const newBrick = Component.bind(null);

  return Object.assign(newBrick as Comp, {
    brick: name,
    parseValue: () => null,
    is: () => false,
    displayName: capitalizeFirstLetter(name || 'UnnamedBrick'),
  }, config || {});
};
