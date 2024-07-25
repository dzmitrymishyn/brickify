export type Change = {
  type: 'add' | 'remove' | 'update';
  value?: unknown;
  path?: string[];
  [key: string]: unknown;
};
