import { isElement } from '@brickifyio/browser/utils';
import { extend, withMatcher, withName, withNodeToBrick, withProps } from '@brickifyio/renderer';

import { withoutHooks } from '../ContainerHooks/withHooks';
import Paragraph from '../Paragraph';

export default extend(
  Paragraph,
  withName('Heading'),
  withoutHooks(),
  withNodeToBrick((node, options, inherit) => ({
    ...inherit?.(node, options) ?? {},
    variant: isElement(node) ? node.tagName.toLowerCase() : 'h1',
  })),
  withMatcher((node) => isElement(node) && node.matches('h1')),
  withProps((inherit) => ({
    ...inherit,
    component: 'h1',
  })),
);
