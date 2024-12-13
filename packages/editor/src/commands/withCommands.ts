import { type RefObject } from 'react';

export type ComponentCommand = (
  containerRef: RefObject<Node | null>
) => void;

export const withCommands = (
  commands: ComponentCommand | ComponentCommand[],
) => ({ commands });

export type WithCommands = {
  commands: ComponentCommand | ComponentCommand[];
};

export const hasCommands = (value: unknown): value is WithCommands => (
  (typeof value === 'object' || typeof value === 'function')
  && value !== null
  && 'commands' in value
  && value.commands !== null
);
