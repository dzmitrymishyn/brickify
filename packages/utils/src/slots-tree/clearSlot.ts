import { type Node } from './node';

export const clearSlot = (node: Node, slotName: string) => {
  node.slots[slotName] = [];
};
