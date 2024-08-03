import { type Node } from './node';
import assert from 'assert';

export const add = (parent: Node, slot: string, node: Node) => {
  assert(parent, 'Parent should be specified');
  assert(typeof parent === 'object', 'Parent should be an object');

  parent.slots[slot] = parent.slots[slot] || [];

  parent.slots[slot].push(node);
  // node.path = [
  //   ...parent.path,
  //   slot,
  //   `${parent.slots[slot].length - 1}`,
  // ];
};
