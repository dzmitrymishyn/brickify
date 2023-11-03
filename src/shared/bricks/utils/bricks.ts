import { Node as DomHandlerNode } from 'domhandler';
import { FC } from 'react';

export type BrickName<Name = string> = {
  brick: Name;
};

export type BrickComponent<Component extends FC<any>> =
  & Component
  & {
    is(node: Node | DomHandlerNode): boolean;
    parseValue(html: string): unknown;
    displayName?: string;
  };

export type Brick<Name = string, Component extends FC<any> = FC<any>> =
  & BrickName<Name>
  & BrickComponent<Component>;

export const isBrick = (brick: unknown): brick is Brick => !!brick
  && typeof brick === 'function'
  && 'brick' in brick
  && (typeof brick.brick === 'string' || typeof brick.brick === 'symbol');
