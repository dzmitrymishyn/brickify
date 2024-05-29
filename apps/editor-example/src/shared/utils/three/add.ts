import { Node } from './node';

export const add = (parent: Node, slot: string, node: Node) => {
  if (parent) {
    parent.slots[slot].push(node);
  }
};
