// import { extend, withName, withProps, withShortcuts } from '@brickifyio/core';

import { extend, withName, withProps } from '@brickifyio/renderer';

import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  // withShortcuts([]),
  withProps({
    component: 'h1',
  }),
);
