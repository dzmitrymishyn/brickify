import { array } from '@brickifyio/operators';
import { type Component } from '@brickifyio/renderer';
import {
  isDocument,
  isTag,
  isText,
  type Node,
} from 'domhandler';
import {
  cloneElement,
  isValidElement,
  type ReactNode,
  type RefObject,
} from 'react';

const hasIs = (value: unknown): value is { is: (node: Node) => boolean } => (
  (typeof value === 'function' || typeof value === 'object')
  && value !== null
  && 'is' in value
  && typeof value.is === 'function'
);

export const domToReactFactory = (
  components: Component[],
  oldDocumentRef: RefObject<ReactNode>,
) => {
  const domToReact = (
    node: Node,
    index: number,
    oldDocument: ReactNode = oldDocumentRef.current,
  ): ReactNode[] => {
    const Component = components.find(
      (component) => hasIs(component) && component.is(node),
    );
    // eslint-disable-next-line -- TODO: check it
    const oldChildNodes = isValidElement(oldDocument)
      // eslint-disable-next-line -- TODO: check it
      ? array((oldDocument.props as any).children) || []
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
      if (
        // eslint-disable-next-line -- TODO: check it
        children.length !== oldChildNodes?.length
        // eslint-disable-next-line -- TODO: check it
        || children.some((child, i) => child !== oldChildNodes[i])
      ) {
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
