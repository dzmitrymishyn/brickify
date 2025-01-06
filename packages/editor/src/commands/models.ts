export type ResultsCallback = {
  <T = unknown>(name: string): T;
  (results: Record<string, unknown>): void;
};

export type RangeCallback = (range?: Range) => Range | null;

export type HandleCommandOptions = {
  originalEvent: KeyboardEvent,
  target: Node;
  descendants: Node[];

  postpone: <Context>(command: PostponedCommand<Context>) => () => void;
  results: ResultsCallback;
  range: Range;

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

export type PostponedCommandType = 'mutation';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- library
 * doesn't use Context at all. It's required only for action.
 */
export type PostponedCommand<Context = any> = {
  action: (context: Context, type: PostponedCommandType) => void;
  condition?: (type: PostponedCommandType) => boolean | 'ignore';
  context?: Context;
};
