import { type Node } from './node';

export const of = (
  value: object,
  slots: string[] = [],
  slotValues: Record<string, Node[]> = {},
): Node => ({
  value,
  slots: slots.reduce((acc, key) => ({
    ...acc,
    [key]: slotValues[key] ?? [],
  }), {}),
});
