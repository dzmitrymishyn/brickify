export type Mutation = MutationRecord | { type: 'after' | 'before' };
export type MutationType = Mutation['type'];
export type MutationHandler = (mutation: Mutation) => void;
