import { type FC, forwardRef, type ForwardRefRenderFunction } from 'react';

import { type Component, getName } from '../components';

export const extend = <C extends Component, Enhancer extends object[]>(
  component: C,
  ...enhancers: Enhancer
): C & Enhancer[number] => {
  // eslint-disable-next-line -- component should have name
  const config: { render?: Function } = Object.assign(
    { displayName: getName(component) },
    ...enhancers,
  );

  const newBrick = typeof component === 'function'
    ? component.bind(null)
    // If it's a forwardRef we need to handle render function that isn't
    // described in the types
    : forwardRef(
      (props, ref) => (component as {
        render: ForwardRefRenderFunction<unknown>;
      }).render(props, ref),
    );

  // Exclude render fn from the old ForwardedRef component
  const { render: _componentRender, ...oldBrick } = component as unknown as {
    render: FC<unknown>;
  };
  const { render: _configRender, ...restConfig } = config;

  return Object.assign(newBrick, oldBrick, restConfig) as C & Enhancer[number];
};
