export type ChangeType = 'remove' | 'add' | 'patch';

export type Change = {
  parent: Omit<Change, 'type' | 'oldValue'> | null;
  depth: number;
  value: unknown;
  slot: string;
  oldValue?: unknown;
  type: ChangeType;
};

type ChangeBase<Type extends string> = {
  type: Type;
  path: string[];
};

export type Add = ChangeBase<'add'> & {
  value: unknown;
};

export type Update = ChangeBase<'update'> & {
  value: unknown;
};

export type Remove = ChangeBase<'remove'> & {
  path: string[];
};

export type Change2 = Add | Update | Remove;
