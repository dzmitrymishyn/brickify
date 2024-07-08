export type ResultsCallback = {
  (name: string): unknown;
  (results: Record<string, unknown>): void;
};

export type RangeCallback = (range?: Range) => Range | null;

export type HandleCommandOptions = {
  event: KeyboardEvent,
  results: ResultsCallback,
  range: RangeCallback;
  element: Node;
};

export type HandleCommandResults = {
  results: Record<string, unknown>;
  range?: Range;
  hasDomChanges: boolean;
};

export type HandleCommand = (options: HandleCommandOptions) => boolean | void;

