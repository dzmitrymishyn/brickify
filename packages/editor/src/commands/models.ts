import { type AnyRange } from '@brickifyio/browser/selection';
import { type RendererStore } from '@brickifyio/renderer';

import { type OnChange } from '../changes';

export type ResultsCallback = {
  (name: string): unknown;
  (results: Record<string, unknown>): void;
};

export type RangeCallback = (range?: Range) => Range | null;

export type HandleCommandOptions = {
  originalEvent: KeyboardEvent,
  target: Node;
  descendants: Node[];

  results: ResultsCallback;
  resultRange: (range?: AnyRange) => void;
  range: RangeCallback;
  getFromStore: RendererStore['get'];
  onChange: OnChange;

  stopBrickPropagation: () => void;
  stopImmediatePropagation: () => void;
};

export type HandleCommand = (options: HandleCommandOptions) => void;

export type CommandObject<Name extends string> = {
  name: Name;
  shortcuts?: string[];
  handle?: HandleCommand;
};

export type CommandFn = HandleCommand;

export type Command<Name extends string = string> =
  | CommandObject<Name>
  | CommandFn;
