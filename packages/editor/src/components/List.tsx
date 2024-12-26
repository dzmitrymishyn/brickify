import {
  extend,
  type PropsWithStoredValue,
  useRendererContext,
  useRendererRegistry,
  withName,
  withSlots,
} from '@brickifyio/renderer';
import { compile } from 'css-select';
import { Node as DomhandlerNode } from 'domhandler';
import { type PropsWithChildren } from 'react';

import { type PropsWithChange, useChanges } from '../changes';
import { useMutation } from '../mutations';

type Props = PropsWithStoredValue & PropsWithChange & PropsWithChildren;

const List: React.FC<Props> = ({ children, stored, onChange }) => {
  const ref = useRendererRegistry<HTMLUListElement>(stored);
  const { store } = useRendererContext();
  const { add } = useChanges();

  const { markToRevert } = useMutation(ref, ({ mutations, removed }) => {
    markToRevert(mutations);

    if (removed) {
      return onChange?.(undefined);
    }

    mutations.reduceRight((_, mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.parentNode !== ref.current) {
          return;
        }

        let current = node.previousSibling;
        let index = 0;
        while (current) {
          if (store.get(current)) {
            index += 1;
          }
          current = current.previousSibling;
        }

        const innerHTML = node instanceof HTMLElement ? node.innerHTML : '';
        const innerText = node instanceof HTMLElement ? node.innerText.trim() : '';
        add([...stored.pathRef.current(), 'children', `${index}`], {
          brick: 'ListItem',
          value: innerText ? innerHTML : '',
          id: Math.random().toFixed(5),
        });
      });

      return _;
    }, null);
  });

  return (
    <ul ref={ref}>
      {children}
    </ul>
  );
};

export default extend(
  List,
  withName('List'),
  withSlots({
    children: 'inherit',
  }),
  { is: (node: DomhandlerNode | Node) => {
    if (node instanceof DomhandlerNode) {
      return compile('ul')(node);
    }

    if (node instanceof HTMLElement) {
      return node.matches('ul');
    }

    return false;
  }},
);
