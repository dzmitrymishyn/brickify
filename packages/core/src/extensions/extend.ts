import { type FC, forwardRef } from 'react';

import { type Component, getName } from '../components';

export const extend = <C extends Component, Enhancer extends object[]>(
  brick: C,
  ...enhancers: Enhancer
): C & Enhancer[number] => {
  // eslint-disable-next-line -- brick is a component so it should have name
  const config: { render?: Function } = Object.assign(
    { displayName: getName(brick) },
    ...enhancers,
  );

  const newBrick = typeof brick === 'function'
    ? brick.bind(null)
    // If it's a forwardRef we need to handle render function that isn't
    // described in the types
    : forwardRef(
      (props, ref) => (brick as { render: FC<unknown> }).render(props, ref),
    );

  // We need to exclude render fn from the old ForwardedRef component
  const { render: _componentRender, ...oldBrick } = brick as unknown as {
    render: FC<unknown>;
  };
  const { render: _configRender, ...restConfig } = config;

  return Object.assign(newBrick, oldBrick, restConfig) as C & Enhancer[number];
};
