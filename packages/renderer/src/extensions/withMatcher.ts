export const withMatcher = <T extends Node>(
  is: (node: T) => boolean,
) => ({ is });

export const withoutMatcher = () => ({ is: undefined });
