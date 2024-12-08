export type ComponentMutations = {
  mutations: MutationRecord[];
  removedDescendants: Node[];
  addedDescendants: Node[];
  removed: boolean;
  domNode: Node;
};

export type ComponentMutationsHandler = (mutation: ComponentMutations) => void;
