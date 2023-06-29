import React from 'react';

export type Brick<Name = string> = {
  brick: Name;
};

export type BrickComponent<Component extends React.FC<any>> =
  & Component
  & {
    is(node: Node): boolean;
    parseValue(html: string): unknown;
  };

export type BrickFactory<Input, Output extends Brick<any>> = {
  of(...props: Input[]): Output;
};
