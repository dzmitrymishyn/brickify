import { extend, withName, withProps, withShortcuts } from '@brickifyio/core';

import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withShortcuts([]),
  withProps({
    component: 'h1',
  }),
);
