import { type Component } from '@brickifyio/renderer';
import { type RefObject } from 'react';

import { useCustomCommands } from './useCustomCommands';
import { hasCommands } from './withCommands';

export const useCommands = (
  ref: RefObject<Node | null>,
  components: Component[],
) => {
  const commands = components
    .flatMap((component) => (
      hasCommands(component)
        ? component.commands
        : []
    ));

  useCustomCommands(ref, commands);
};
