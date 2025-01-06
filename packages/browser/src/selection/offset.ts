import { getFirstDeepLeaf, isText } from '../utils';

export type OffsetCase = 'start' | 'end' | null | undefined;

export type OffsetPoint = {
  offset: number;
  node: Node;
  offsetCase?: OffsetCase;
};

const getNextPossibleSibling = (node: Node, container?: Node): Node | null => {
  let current: Node | null = node;
  while (current && container !== current && !current.nextSibling) {
    current = current.parentNode;
  }
  return current === container ? null : (current?.nextSibling ?? null);
};

const getPreviousPossibleSibling = (node: Node, container?: Node): Node | null => {
  let current: Node | null = node;
  while (current && container !== current && !current.previousSibling) {
    current = current.parentNode;
  }
  return current === container ? null : (current?.previousSibling ?? null);
};

const isBr = (node: Node): node is HTMLBRElement => node.nodeName === 'BR';

const getSimpleNodeLength = (node: Node) => {
  if (isBr(node)) {
    return 1;
  }

  if (isText(node)) {
    return node.textContent?.length || 0;
  }

  return 0;
};

const getNodeLength = (node: Node) => {
  if (!node.childNodes?.length) {
    return getSimpleNodeLength(node);
  }

  const stack: Node[] = [node];
  let length = 0;
  let current: Node | null = node.childNodes[0];

  while (current && stack.length) {
    while (current.childNodes.length) {
      stack.push(current);
      current = current.childNodes[0];
    }

    length += getSimpleNodeLength(current);

    while (current && !current.nextSibling) {
      current = stack.pop() ?? null;
    }
    current = current?.nextSibling ?? null;
  }

  return length;
};

const isNodeEnd = (node: Node, offset: number) => {
  if (isText(node)) {
    return node.textContent?.length === offset;
  }

  return node.childNodes?.length === offset;
};

export const getCursorPosition = (parent: Node, node: Node, offset = 0) => {
  let fullOffset = 0;
  let current: Node | null = node;
  let offsetCase: OffsetCase;

  if (offset === 0) {
    offsetCase = 'start';
  } else if (isNodeEnd(node, offset)) {
    offsetCase = 'end';
  }

  if (isText(current)) {
    fullOffset += offset;
    current = getPreviousPossibleSibling(current, parent);
  } else {
    current = current.childNodes[offset - 1]
      || getPreviousPossibleSibling(current, parent);
  }

  while (current) {
    fullOffset += getNodeLength(current);
    current = getPreviousPossibleSibling(current, parent);
  }

  return { offset: fullOffset, offsetCase };
};

export const getNodeByOffset = (
  { node, offset, offsetCase }: OffsetPoint,
): { offset: number; node: Node } => {
  let currentOffset = 0;
  let current: Node | null = node;

  while (current && currentOffset <= offset) {
    current = getFirstDeepLeaf(current) ?? current;

    const newOffset = currentOffset + getNodeLength(current);

    // Only BR node without any content could pass to this block. In this
    // case we have to set selection to the next node
    if (newOffset === offset && (offsetCase === 'start' || isBr(current))) {
      return {
        offset: 0,
        node: getFirstDeepLeaf(getNextPossibleSibling(current, node))
          ?? current,
      }
    }

    if (newOffset >= offset) {
      return {
        offset: offset - currentOffset,
        node: current,
      };
    }

    currentOffset = newOffset;

    current = getNextPossibleSibling(current, node);
  }

  throw new Error(`Passed offset (${offset}) is outside the container`);
};
