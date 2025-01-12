import { isText } from '@brickifyio/browser/utils';
import { extend } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type RefObject } from 'react';

import { useCommand } from '../commands';
import { withHooks } from '../ContainerHooks';

const Br: React.FC = () => <br />;

const useBr = (ref: RefObject<Node | null>) => {
  useCommand(ref, {
    name: 'br',
    shortcuts: ['enter'],
    handle: ({ originalEvent, range }) => {
      if (!ref.current?.contains(range.startContainer)) {
        return;
      }

      originalEvent.preventDefault();
      range.deleteContents();

      const br = document.createElement('br');
      range.insertNode(br);

      if (
        (!br.nextSibling && br.previousSibling?.nodeName !== 'BR')
        || (
          isText(br.nextSibling)
          && !br.nextSibling.textContent?.length
          && !br.nextSibling.nextSibling
        )
      ) {
        range.insertNode(document.createElement('br'));
      }

      range.setStartAfter(br);
      range.setEndAfter(br);
    },
  });
};

export default extend(
  Br,
  { is: compile('br') },
);

export const EnterBr = extend(
  Br,
  { is: compile('br') },
  withHooks([useBr]),
);
