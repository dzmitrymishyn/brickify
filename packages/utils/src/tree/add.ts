import { type Node } from './node';

export const add = (parent: Node | null | undefined, slot: string, node: Node) => {
  if (parent) {
    parent.slots[slot].push(node);
  }
};
