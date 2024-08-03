import { type Command } from '../commands';

export const withShortcuts = (
  commands: Command[],
) => ({ commands });

export type WithCommands = {
  commands: Command[];
};

export const hasShortcuts = (value: unknown): value is WithCommands => (
  (typeof value === 'object' || typeof value === 'function')
  && value !== null
  && 'commands' in value
  && value.commands !== null
  && typeof value.commands === 'object'
);
