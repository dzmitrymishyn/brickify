export type BrickValue<Name = string> = {
  brick: Name;
};

export const isBrickValue = (value: unknown): value is { brick: string } =>
  !!value && typeof value === 'object' && 'brick' in value && typeof value.brick === 'string';
