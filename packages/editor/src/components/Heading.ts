import { extend, withName, withProps } from '../core';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withProps({
    component: 'h1',
  }),
);
