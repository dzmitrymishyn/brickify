import { extend, withName } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren , type RefObject } from 'react';

import { withHooks } from '../ContainerHooks';
import { useReshapeCommand } from '../hooks/useReshapeCommand';
import { createReshapePatternHook } from '../inline';

const Strong: React.FC<PropsWithChildren> = ({ children }) => (
  <strong>{children}</strong>
);

const component = {
  selector: 'strong',
  create: () => document.createElement('strong'),
};

const useStrongCommand = (ref: RefObject<Node | null>) => {
  useReshapeCommand(
    ref,
    'formatStrong',
    ['ctrl + b', 'cmd + b'],
    component,
  );
};

export default extend(
  Strong,
  withName('Strong'),
  { is: compile('strong') },
  withHooks([
    useStrongCommand,
    createReshapePatternHook(
      component,
      // eslint-disable-next-line prefer-named-capture-group -- ok for now
      /(?:^|\s)(__(?!\s)([^_]*[^\s*])__)\s?$/g,
    ),
    createReshapePatternHook(
      component,
      // eslint-disable-next-line prefer-named-capture-group -- ok for now
      /(?:^|\s)(\*\*(?!\s)([^*]*[^\s*])\*\*)\s?$/g,
    ),
  ]),
);
