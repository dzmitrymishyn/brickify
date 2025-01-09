import { array } from '@brickifyio/operators';
import { type Component, getName } from '@brickifyio/renderer';
import { type RefObject, useMemo } from 'react';

import { hasHooks, type WithHooks, withHooks } from './withHooks';

type CommandProps = {
  component: Component & WithHooks;
  containerRef: RefObject<HTMLElement | null>;
};

const HookExecutor: React.FC<CommandProps> = ({
  component,
  containerRef,
}) => {
  array(component.hooks).forEach(
    (hook) => typeof hook === 'function' && hook(containerRef),
  );

  return null;
};

export type CommanderProps = {
  components: Component[] | Record<string, Component>;
  containerRef: RefObject<HTMLElement | null>;
};

/**
 * The component is used for safe register of N hooks. You can pass N
 * components with a hook and it render them in its own components. It secure
 * components modification (you can remove or add components) without errors.
 */
export const ContainerHooks: React.FC<CommanderProps> = ({
  components,
  containerRef,
}) => {
  const nodes = useMemo(() => Object.values(components || {}).map((component) => (
    hasHooks(component)
      ? <HookExecutor
          key={getName(component)}
          containerRef={containerRef}
          component={component}
        />
      : null
  )), [components, containerRef]);

  return (
    <>
      {nodes}
    </>
  );
};

export { hasHooks, type WithHooks, withHooks };
