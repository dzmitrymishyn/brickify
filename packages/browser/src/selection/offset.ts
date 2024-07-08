import { getFirstDeepLeaf } from '../utils';

export type ChildOffsetType = 'start' | 'end' | 'center';

export type OffsetPoint = {
  offset: number;
  node: Node;
  childOffsetType?: ChildOffsetType;
  childOffset?: number;
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

  if (node.nodeType === Node.TEXT_NODE) {
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

export const getCursorPosition = (parent: Node, node: Node, offset = 0) => {
  let length = 0;

  if (node.nodeType === Node.TEXT_NODE) {
    length += offset;
  } else {
    for (let i = 0; i < offset; i += 1) {
      length += getNodeLength(node.childNodes[i]);
    }
  }

  let current: Node | null = node;
  while (current) {
    current = getPreviousPossibleSibling(current, parent);

    if (current) {
      length += getNodeLength(current);
    }
  }

  let childOffsetType: ChildOffsetType = offset === 0 ? 'start' : 'center';

  if (node.nodeType === Node.TEXT_NODE && node.textContent?.length === offset && offset) {
    childOffsetType = 'end';
  }

  return { offset: length, childOffset: offset, childOffsetType };
};

export const getNodeByOffset = (
  { node, offset, childOffsetType }: OffsetPoint,
): { offset: number; node: Node } => {
  let length = 0;
  let current: Node | null = node;
  while (current && length <= offset) {
    current = getFirstDeepLeaf(current)!;

    const newLength = length + getSimpleNodeLength(current);

    if (newLength >= offset) {
      if (isBr(current)) {
        return {
          node: current.parentNode!,
          offset: Array.from(current.parentElement?.childNodes ?? []).indexOf(current) + 1,
        };
      }

      if (childOffsetType === 'start' && newLength - offset === 0) {
        current = getFirstDeepLeaf(getNextPossibleSibling(current, node)) || current;
        length = offset;
      }

      return { node: current, offset: offset - length };
    }

    length = newLength;

    current = getNextPossibleSibling(current, node);
  }
  return { node: current!, offset };
};
