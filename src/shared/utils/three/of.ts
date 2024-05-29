import { Node } from './node';

export const of = (value: unknown, slots: string[]): Node => ({
  value,
  slots: slots.reduce((acc, key) => ({ ...acc, [key]: [] }), {}),
});
