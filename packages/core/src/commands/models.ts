import { type Change } from '../changes';
import { type PathRange } from '../ranges';
import { type BrickStore } from '../store';

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
  resultRange: (range?: Range | PathRange) => void;
  range: RangeCallback;
  getFromStore: BrickStore['get'];
  onChange: (...changes: Change[]) => void;
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
