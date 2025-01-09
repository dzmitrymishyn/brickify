import { extend, withMatcher, withName, withProps } from '@brickifyio/renderer';

import { withHooks } from '../ContainerHooks';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withHooks([]),
  withMatcher((node) => node instanceof HTMLElement && node.matches('h1')),
  withProps({
    component: 'h1',
  }),
);
