export type Change = {
  type: 'add' | 'remove' | 'update';
  value?: object;
  path: string[];
};
