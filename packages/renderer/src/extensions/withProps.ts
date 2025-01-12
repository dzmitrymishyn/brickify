import { createWith } from './createWith';

export const withProps = createWith('props')<object>;

export const hasProps = <T extends object>(
  component: unknown
): component is { props: T } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'props' in component
);
