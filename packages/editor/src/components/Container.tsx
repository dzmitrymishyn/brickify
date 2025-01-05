import { getRange, restoreRange, toRangeCopy } from '@brickifyio/browser/selection';
import {
  extend,
  handleAddedNodes,
  hasNodeToBrick,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
  withSlots,
} from '@brickifyio/renderer';
import { type FC, type PropsWithChildren, useRef } from 'react';

import { type PropsWithChange, useChanges } from '../changes';
import { Commander } from '../commands';
import { useMutation } from '../mutations';

type Props = PropsWithStoredValue & PropsWithChange & PropsWithChildren;

const Container: FC<Props> = ({ children, stored, onChange }) => {
  const ref = useRendererRegistry<HTMLDivElement>(stored);
  const labelRef = useRef<HTMLDivElement>(null);
  const { add } = useChanges();
  const { markToRevert } = useMutation(ref, ({ removed, mutations, addedDescendants }) => {
    markToRevert(mutations);

    if (removed || ref.current?.firstChild === labelRef.current) {
      onChange?.(undefined);
    }

    const range = toRangeCopy(getRange());

    handleAddedNodes({
      add: ({ node, index, component }) => {
        if (
          node === ref.current?.lastChild?.previousSibling
          && node instanceof HTMLElement
          && node.previousSibling instanceof HTMLElement
          && node.previousSibling.textContent === ''
        ) {
          node.previousSibling.remove();
          ref.current.insertAdjacentElement('afterend', node);
          return;
        }

        if (hasNodeToBrick(component)) {
          add(
            [...stored.pathRef.current(), 'children', `${index}`],
            component.nodeToBrick(node, {
              components: stored.components,
              component,
            }),
          );
        }
      },
      addedNodes: addedDescendants,
      allNodes: Array.from(ref.current?.childNodes ?? []),
      components: stored.components,
    });

    restoreRange(range);
  });

  return (
    <div
      ref={ref}
      data-brick="container"
      style={{
        width: 500,
        margin: '32px auto 0',
        position: 'relative',
        border: '1px solid #ccc',
      }}
    >
      <Commander containerRef={ref} components={stored.components || {}} />
      {children}
      <div
        ref={labelRef}
        contentEditable="false"
        suppressContentEditableWarning
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          height: 20,
          top: -20,
          left: 0,
          background: '#ccc',
        }}
      >
        Container
      </div>
    </div>
  );
};

export default extend(
  Container,
  withSlots({
    children: 'inherit',
  }),
  withName('Container'),
);
