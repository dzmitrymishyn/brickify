import { defaultProps, displayName, extend } from '../core';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  displayName('Heading'),
  defaultProps({
    component: 'h1',
  }),
);
