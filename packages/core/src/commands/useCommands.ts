import { useCustomCommands } from './useCustomCommands';
import { type OnChange } from '../changes';
import { type AnyComponent } from '../components';
import { hasShortcuts } from '../extensions';

export const useCommands = (
  bricks: AnyComponent[],
  onChange?: OnChange,
) => {
  const commands = bricks
    .flatMap((brick) => (
      hasShortcuts(brick)
        ? Object.values(brick.commands)
        : []
    ));

  return useCustomCommands(
    commands,
    onChange,
  );
};
