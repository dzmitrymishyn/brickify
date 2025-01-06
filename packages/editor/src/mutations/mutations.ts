export type ComponentMutations = {
  mutations: MutationRecord[];
  removedDescendants: Node[];
  addedDescendants: Node[];
  removed: boolean;
  domNode: Node;
  range?: Range | null;
};

export type ComponentMutationsHandler = (mutation: ComponentMutations) => void;
