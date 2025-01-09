import { fromRangeCopy } from './rangeCopy';
import {
  findLeaf,
  getFirstDeepLeaf,
  getNextPossibleSibling,
  getPreviousPossibleSibling,
  reduceLeavesRight,
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

const getNodeLength = (node: Node, offset?: number) => {
  if (isBr(node) || isText(node)) {
    return offset ?? getSimpleNodeLength(node);
  }

  if (isElement(node)) {
    let length = 0;
    const childrenLength = offset ?? node.childNodes.length;
    for (let index = 0; index < (offset ?? childrenLength); index += 1) {
      length += getNodeLength(node.childNodes[index]);
    }
    return length;
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
  container: Node,
  node: Node,
  offset = 0,
): OffsetPoint => {
  let offsetCase: OffsetCase;

  if (offset === 0) {
    offsetCase = 'start';
  } else if (isNodeEnd(node, offset)) {
    offsetCase = 'end';
  }

  const fullOffset = reduceLeavesRight(
    getNodeLength(node, offset),
    container,
    getPreviousPossibleSibling(node, container),
    (acc, current) => acc + getNodeLength(current),
  );

  return { offset: fullOffset, offsetCase, container };
};

export const getNodeByOffset = (
  startNode: Node,
  offset: number,
  offsetCase?: OffsetCase,
  container?: Node,
) => {
  const range = container ? fromRangeCopy({
    startContainer: container,
    startOffset: 0,
    endContainer: container,
    endOffset: container.childNodes?.length
      ?? container.textContent?.length
      ?? 0,
  }) : null;

  let currentOffset = 0;
  let resultOffset = 0;

  const node = findLeaf(startNode, (current) => {
    if (!(range?.intersectsNode(current) ?? true)) {
      return 'break';
    }

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
      node: getFirstDeepLeaf(getNextPossibleSibling(node, container))
        ?? node,
    };
  }

  return {
    offset: offset - currentOffset,
    node,
  };
};
