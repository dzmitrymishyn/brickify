import { extend, withName, withProps } from '@brickifyio/renderer';

import { withCommands } from '../commands';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withCommands([]),
  withProps({
    component: 'h1',
  }),
);
