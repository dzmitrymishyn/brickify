import { array } from '@brickifyio/operators';
import { type Component, getName } from '@brickifyio/renderer';
import { type RefObject, useMemo } from 'react';

import { hasCommands, type WithCommands } from './withCommands';

type CommandProps = {
  component: Component & WithCommands;
  ref: RefObject<Node | null>;
};

const Command: React.FC<CommandProps> = ({
  component,
  ref,
}) => {
  array(component.commands).forEach(
    (command) => typeof command === 'function' && command(ref),
  );

  return null;
};

export type CommanderProps = {
  components: Component[];
  containerRef: RefObject<Node | null>;
};

/**
 * The component is used for safe register of N hooks. You can pass N
 * components with a hook and it render them in its own components. It secure
 * components modification (you can remove or add components) without errors.
 */
export const Commander: React.FC<CommanderProps> = ({
  components,
  containerRef,
}) => {
  const nodes = useMemo(() => components.map((component) => (
    hasCommands(component)
      ? <Command
          key={getName(component)}
          ref={containerRef}
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
