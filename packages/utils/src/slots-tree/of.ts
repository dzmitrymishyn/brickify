import { type Node } from './node';

export const of = (
  value: object,
  // slots: string[] = [],
  _path: string[] = [],
): Node => ({
  value,
  // path,
  slots: {},
  // slots: slots.reduce((acc, key) => ({
  //   ...acc,
  //   [key]: [],
  // }), {}),
});
