export const withProps = (props: object) => ({
  props,
});

export const hasProps = <T extends object>(
  component: unknown
): component is { props: T } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'props' in component
);
