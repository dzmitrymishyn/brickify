export type BrickValue<Name extends string = string, Identifier = any> = {
  brick: Name;
  id?: Identifier;
};

export const isBrickValue = (value: unknown): value is BrickValue => (
  !!value
  && typeof value === 'object'
  && 'brick' in value
  && typeof value.brick === 'string'
);
