export type ChangeBase<Type extends string> = {
  type: Type;
  path: string[];
};

export type Add = ChangeBase<'add'> & {
  value: object;
};

export type Update = ChangeBase<'update'> & {
  value: object;
};

export type Remove = ChangeBase<'remove'>;

export type Change = Add | Update | Remove;
