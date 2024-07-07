import { defaultProps, displayName, extend } from '../bricks';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  displayName('Heading'),
  defaultProps({
    component: 'h1',
  }),
);
