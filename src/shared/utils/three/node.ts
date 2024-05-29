export type Node = {
  value: unknown;
  slots: Record<string, Node[]>;
};
