import { createWith, createWithCallback } from './createWith';

export const withMatcher = createWithCallback('is')<[Node], boolean>;
export const withoutMatcher = createWith('is')(null);

export const hasMatcher = (
  component: unknown,
): component is { is: <T>(node: T) => boolean } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'is' in component
  && typeof component.is === 'function'
);
