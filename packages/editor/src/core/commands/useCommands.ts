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
    // flow(
    //   (options) => {
    //     bricks
    //       .flatMap((brick) => (
    //         hasShortcuts(brick)
    //           ? Object.values(brick.commands)
    //           : []
    //       ))
    //       .forEach((handle) => {
    //         const hasMatch = handle && shortcuts?.some(
    //           (shortcut) => match(options.originalEvent, shortcut),
    //         );

    //         if (hasMatch) {
    //           handle({
    //             ...options,
    //             onChange: trackChanges ?? options.onChange,
    //           });
    //         }
    //       });
    //   },
    // )
  );
};
