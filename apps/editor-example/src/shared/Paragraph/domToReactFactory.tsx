import {
  isDocument,
  isTag,
  isText,
  Node,
} from 'domhandler';
import {
  cloneElement,
  isValidElement,
  ReactNode,
  RefObject,
} from 'react';

import { NamedComponent } from '@/shared/bricks/brick';
import { array } from '@brickify/operators';

const hasIs = (value: unknown): value is { is: any } => (
  (typeof value === 'function' || typeof value === 'object')
  && !!value
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
    const Component: any = bricks.find((brick) => hasIs(brick) && brick.is(node));
    const oldChildNodes = isValidElement(oldDocument)
      ? array(oldDocument.props.children) || []
      : [];

    if (!Component) {
      if (isTag(node) || isDocument(node)) {
        return node.childNodes.map(
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
      (n, i) => domToReact(n, i, oldChildNodes[i] || null),
    ).flat();

    if (isValidElement(oldDocument) && oldDocument.type === Component) {
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
