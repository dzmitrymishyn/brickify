export type Mutation = {
  remove: boolean;
  removedNodes: Node[];
  addedNodes: Node[];
  target: Node;
};

export type MutationHandler = (mutation: Mutation) => void;
