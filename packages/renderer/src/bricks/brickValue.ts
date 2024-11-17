export type BrickValue<Name extends string = string> = {
  brick: Name;
  id?: number | string;
  [key: string]: unknown;
};

export const isBrickValue = (value: unknown): value is BrickValue => (
  typeof value === 'object'
  && value !== null
  && 'brick' in value
  && typeof value.brick === 'string'
);
