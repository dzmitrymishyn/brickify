export type BrickValue<Name extends string = string, Identifier = number> = {
  brick: Name;
  id?: Identifier;
};

export const isBrickValue = (value: unknown): value is BrickValue => (
  typeof value === 'object'
  && value !== null
  && 'brick' in value
  && typeof value.brick === 'string'
);
