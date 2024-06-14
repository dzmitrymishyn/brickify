import { type Node } from './node';
import assert from 'assert';

export const add = (parent: Node, slot: string, node: Node) => {
  assert(parent, 'Parent should be specified');
  assert(typeof parent === 'object', 'Parent should be an object');
  assert(Array.isArray(parent.slots[slot]), 'Slot should be in the parent');

  parent.slots[slot].push(node);
};
