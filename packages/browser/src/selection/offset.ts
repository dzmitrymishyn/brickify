import {
  findLeaf,
  getFirstDeepLeaf,
  getNextPossibleSibling,
  reduceLeaves,
} from '../traverse';
import { isBr, isElement, isText } from '../utils';
import assert from 'assert';

export type OffsetCase = 'start' | 'end' | null | undefined;

export type OffsetPoint = {
  offset: number;
  container: Node;
  offsetCase?: OffsetCase;
};

const getSimpleNodeLength = (node: Node) => {
  if (isBr(node)) {
    return 1;
  }

  if (isText(node)) {
    return node.textContent?.length || 0;
  }

  return 0;
};

const isNodeEnd = (node: Node, offset: number) => {
  if (isText(node)) {
    return node.textContent?.length === offset;
  }

  return node.childNodes?.length === offset;
};

export const getCursorPosition = (
  parent: Node,
  node: Node,
  offset = 0,
): OffsetPoint => {
  const fullOffset = reduceLeaves(
    isElement(node) ? 0 : offset,
    parent,
    isElement(node) ? node.childNodes[offset] : node,
    (acc, current) => {
      return acc + getSimpleNodeLength(current);
    },
  );
  let offsetCase: OffsetCase;

  if (offset === 0) {
    offsetCase = 'start';
  } else if (isNodeEnd(node, offset)) {
    offsetCase = 'end';
  }

  return { offset: fullOffset, offsetCase, container: parent };
};

export const getNodeByOffset = (
  container: Node,
  offset: number,
  offsetCase?: OffsetCase,
) => {
  let currentOffset = 0;
  let resultOffset = 0;

  const node = findLeaf(container, (current) => {
    const newOffset = currentOffset + getSimpleNodeLength(current);

    if (newOffset >= offset) {
      resultOffset = newOffset;
      return true;
    }

    currentOffset = newOffset;

    return false;
  });

  assert(node, `Passed offset (${offset}) is outside the container`);

  if (resultOffset === offset && (offsetCase === 'start' || isBr(node))) {
    return {
      offset: 0,
      node: getFirstDeepLeaf(getNextPossibleSibling(node))
        ?? node,
    };
  }

  return {
    offset: offset - currentOffset,
    node,
  };
};
