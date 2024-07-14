import { match } from '@brickifyio/browser/hotkeys';
import { flow } from 'fp-ts/lib/function';

import { type HandleCommandOptions } from './models';
import { useCustomCommands } from './useCustomCommands';
import { type ChangeEvent } from '../changes';
import { type Component } from '../components';
import { hasShortcuts } from '../extensions';

export type Command<Name extends string> = {
  name: Name;
  shortcuts?: string[];
  handle?: (options: HandleCommandOptions) => void;
};

export type Commands<C extends Command<string>> = {
  [K in C['name']]: Omit<Extract<C, { name: K }>, 'name'>;
};

export const useCommands = (
  bricks: Component[],
  trackChanges?: (...changes: ChangeEvent[]) => void,
) => useCustomCommands(flow(
  (options) => {
    bricks
      .flatMap((brick) => (
        hasShortcuts(brick)
          ? Object.values(brick.commands)
          : []
      ))
      .forEach(({ handle, shortcuts }) => {
        const hasMatch = handle && shortcuts?.some(
          (shortcut) => match(options.event, shortcut),
        );

        if (hasMatch) {
          handle({
            ...options,
            onChange: trackChanges ?? options.onChange,
          });
        }
      });
  },
));
