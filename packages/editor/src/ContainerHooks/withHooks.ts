import { createWith } from '@brickifyio/renderer/src/extensions/createWith';
import { type RefObject } from 'react';

export type ContainerHook<E extends Node = HTMLElement> = (
  containerRef: RefObject<E | null>,
) => void;

export type WithHooks = {
  hooks: ContainerHook | ContainerHook[];
};

export const withHooks = createWith('hooks')<ContainerHook[]>;
export const withoutHooks = createWith('hooks')([]);

export const hasHooks = (Component: unknown): Component is WithHooks => (
  (typeof Component === 'object' || typeof Component === 'function')
  && Component !== null
  && 'hooks' in Component
  && Component.hooks !== null
);
