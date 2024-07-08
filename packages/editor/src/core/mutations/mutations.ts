export type Mutation = {
  remove: boolean;
  removedNodes: Node[];
  addedNodes: Node[];
};

export type MutationHandler = (mutation: Mutation) => void;
