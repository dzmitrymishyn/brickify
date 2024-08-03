export const withProps = (props: object) => ({
  props,
});

export const hasProps = (
  component: unknown
): component is { props: object } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'props' in component
);
