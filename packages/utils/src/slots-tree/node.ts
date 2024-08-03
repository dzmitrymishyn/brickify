export type Node = {
  value: object;
  slots: Record<string, Node[]>;
  // path: string[];
};
