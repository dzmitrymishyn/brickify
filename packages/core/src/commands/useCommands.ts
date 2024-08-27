import { useCustomCommands } from './useCustomCommands';
import { type Component } from '../components';
import { hasShortcuts } from '../extensions';

export const useCommands = (
  bricks: Component[],
) => {
  const commands = bricks
    .flatMap((brick) => (
      hasShortcuts(brick)
        ? Object.values(brick.commands)
        : []
    ));

  return useCustomCommands(
    commands,
  );
};
