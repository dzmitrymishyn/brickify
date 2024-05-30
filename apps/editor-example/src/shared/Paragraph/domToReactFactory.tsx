import { array } from '@brickifyio/operators';
import {
  isDocument,
  isTag,
  isText,
  type Node,
} from 'domhandler';
import React, {
  cloneElement,
  isValidElement,
  type ReactNode,
  type RefObject,
} from 'react';

import { type NamedComponent } from '@/shared/bricks/brick';

// eslint-disable-next-line -- TODO: check it
const hasIs = (value: unknown): value is { is: any } => (
  (typeof value === 'function' || typeof value === 'object')
  && value !== null
  && 'is' in value
  && typeof value.is === 'function'
);

export const domToReactFactory = (
  bricks: NamedComponent[],
  oldDocumentRef: RefObject<ReactNode>,
) => {
  const domToReact = (
    node: Node,
    index: number,
    oldDocument: ReactNode = oldDocumentRef.current,
  ): ReactNode[] => {
    // eslint-disable-next-line -- TODO: check it
    const Component: any = bricks.find((brick) => hasIs(brick) && brick.is(node));
    // eslint-disable-next-line -- TODO: check it
    const oldChildNodes = isValidElement(oldDocument)
      // eslint-disable-next-line -- TODO: check it
      ? array(oldDocument.props.children) || []
      : [];

    if (!Component) {
      if (isTag(node) || isDocument(node)) {
        return node.childNodes.map(
          // eslint-disable-next-line -- TODO: check it
          (n, i) => domToReact(n, index + i, oldChildNodes[i] || null),
        ).flat();
      }
      if (isText(node)) {
        return [node.data];
      }
      return [];
    }

    if (!isTag(node)) {
      return [];
    }

    const children = node.childNodes.map(
      // eslint-disable-next-line -- TODO: check it
      (n, i) => domToReact(n, i, oldChildNodes[i] || null),
    ).flat();

    if (isValidElement(oldDocument) && oldDocument.type === Component) {
      // eslint-disable-next-line -- TODO: check it
      if (children.some((child, i) => child !== oldChildNodes[i])) {
        return [cloneElement(oldDocument, {}, ...children)];
      }
      return [oldDocument];
    }

    return [(
      <Component key={index}>
        {children}
      </Component>
    )];
  };

  return domToReact;
};
