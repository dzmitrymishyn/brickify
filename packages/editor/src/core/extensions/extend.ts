import { type FC, forwardRef } from 'react';

import { type Component } from '../components';

export const extend = <C extends Component | FC, Enhancer extends object[]>(
  brick: C,
  ...enhancers: Enhancer
): C & Enhancer[number] => {
  // eslint-disable-next-line -- TODO: Check it
  const config = Object.assign(
    { displayName: brick.displayName },
    ...enhancers,
  );

  const newBrick = typeof brick === 'function'
    ? brick.bind(null)
    // If it's a forwardRef we need to handle render function that isn't
    // described in the types
    // eslint-disable-next-line -- the component doesn't have displayName
    : forwardRef(
      (props, ref) => (brick as { render: FC<unknown> }).render(props, ref),
    );

  // We need to exclude render fn from the old ForwardedRef component
  const { render: _componentRender, ...oldBrick } = brick as unknown as {
    render: FC<unknown>;
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- 1
  const { render: _configRender, ...restConfig } = config;

  // eslint-disable-next-line -- TODO: Check it
  return Object.assign(newBrick, oldBrick, restConfig);
};
