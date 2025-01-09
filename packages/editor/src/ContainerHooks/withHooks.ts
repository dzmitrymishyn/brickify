import { type RefObject } from 'react';

export type ContainerHook<E extends Node = HTMLElement> = (
  containerRef: RefObject<E | null>,
) => void;

export type WithHooks = {
  hooks: ContainerHook | ContainerHook[];
};

export const withHooks = (
  hooks: WithHooks['hooks'],
) => ({ hooks });

export const hasHooks = (Component: unknown): Component is WithHooks => (
  (typeof Component === 'object' || typeof Component === 'function')
  && Component !== null
  && 'hooks' in Component
  && Component.hooks !== null
);
