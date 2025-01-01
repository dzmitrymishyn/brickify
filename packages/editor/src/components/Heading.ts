import { extend, withMatcher, withName, withProps } from '@brickifyio/renderer';

import { withCommands } from '../commands';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withCommands([]),
  withMatcher((node) => node instanceof HTMLElement && node.matches('h1')),
  withProps({
    component: 'h1',
  }),
);
