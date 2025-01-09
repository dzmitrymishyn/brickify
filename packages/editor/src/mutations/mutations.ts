import { type ResultsFn } from '../utils';

export type ComponentMutations<R extends object = object> = {
  mutations: MutationRecord[];
  removedDescendants: Node[];
  addedDescendants: Node[];
  removed: boolean;
  domNode: Node;
  range?: Range | null;
  results: ResultsFn<R>;
};

export type ComponentMutationsHandler<R extends object = object> = (
  mutation: ComponentMutations<R>,
) => void;
