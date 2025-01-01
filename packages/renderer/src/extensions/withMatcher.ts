export const withMatcher = <T extends Node>(
  is: (node: T) => boolean,
) => ({ is });

export const withoutMatcher = () => ({ is: undefined });

export const hasMatcher = (
  component: unknown,
): component is { is: <T>(node: T) => boolean } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'is' in component
  && typeof component.is === 'function'
);
