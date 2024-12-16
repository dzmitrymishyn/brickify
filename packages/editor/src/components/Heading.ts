import { extend, withName, withProps } from '@brickifyio/renderer';
import { compile } from 'css-select';
import { Node as DomhandlerNode } from 'domhandler';

import { withCommands } from '../commands';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withCommands([]),
  {
    is: (node: DomhandlerNode | Node) => {
      if (node instanceof DomhandlerNode) {
        return compile('h1')(node);
      }

      if (node instanceof HTMLElement) {
        return node.matches('h1');
      }

      return false;
    },
  },
  withProps({
    component: 'h1',
  }),
);
