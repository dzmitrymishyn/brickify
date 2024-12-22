import { type RefObject } from 'react';

export type CommandHook = (containerRef: RefObject<Node | null>) => void;

export type WithCommands = {
  commands: CommandHook | CommandHook[];
};

export const withCommands = (
  commands: WithCommands['commands'],
) => ({ commands });

export const hasCommands = (value: unknown): value is WithCommands => (
  (typeof value === 'object' || typeof value === 'function')
  && value !== null
  && 'commands' in value
  && value.commands !== null
);
