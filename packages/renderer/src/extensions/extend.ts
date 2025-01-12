import { type FC, forwardRef, type ForwardRefRenderFunction } from 'react';

import { type Component } from '../components';

export const extend = <C extends Component, Enhancer extends object[]>(
  component: C,
  ...enhancers: Enhancer
): C & Enhancer[number] => {
  const config = enhancers.reduce<{ render?: () => void }>((acc, current) => {
    if (typeof current === 'function') {
      return {
        ...acc,
        ...current(component) as object,
      };
    }

    if (typeof current === 'object' && current !== null) {
      return {
        ...acc,
        ...current,
      };
    }

    return acc;
  }, {});

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
