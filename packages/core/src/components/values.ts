export type BrickValue<Name extends string = string, Identifier = number> = {
  brick: Name;
  id?: Identifier;
  [key: string]: unknown;
};

export const isBrickValue = (value: unknown): value is BrickValue => (
  typeof value === 'object'
  && value !== null
  && 'brick' in value
  && typeof value.brick === 'string'
);
