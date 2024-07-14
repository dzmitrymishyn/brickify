import { type Command, type Commands } from '../../core/commands';

export const shortcuts = <C extends Command<string>>(
  commands: Commands<C>,
) => ({ commands });

export type WithCommands = {
  commands: Commands<Command<string>>;
};

export const hasShortcuts = (value: unknown): value is WithCommands => (
  (typeof value === 'object' || typeof value === 'function')
  && value !== null
  && 'commands' in value
  && value.commands !== null
  && typeof value.commands === 'object'
);
