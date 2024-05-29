export type ChangeBase<Type extends string> = {
  type: Type;
  path: string[];
};

export type Add = ChangeBase<'add'> & {
  value: unknown;
};

export type Update = ChangeBase<'update'> & {
  value: unknown;
};

export type Remove = ChangeBase<'remove'>;

export type Change = Add | Update | Remove;
