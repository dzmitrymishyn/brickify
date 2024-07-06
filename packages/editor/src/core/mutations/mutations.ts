export type MutationMutate = {
  type: 'mutate';
  remove: boolean;
  removedNodes: Node[];
  addedNodes: Node[];
};

export type MutationAfter = {
  type: 'after';
};

export type MutationBefore = {
  type: 'before';
};

export type Mutation = MutationAfter | MutationBefore | MutationMutate;
export type MutationType = Mutation['type'];

export type MutationHandler = (mutation: Mutation) => void;
