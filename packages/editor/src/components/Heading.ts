import { extend, withName, withProps, withShortcuts } from '../core';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withShortcuts([]),
  withProps({
    component: 'h1',
  }),
);
