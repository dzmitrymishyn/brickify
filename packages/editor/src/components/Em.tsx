import { extend, withName } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren, type RefObject } from 'react';

import { withCommands } from '../commands';
import { useReshapeCommand } from '../hooks/useReshapeCommand';
import { createReshapePatternHook } from '../inline';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

const component = {
  selector: 'em',
  create: () => document.createElement('em'),
};

const useEmCommand = (ref: RefObject<HTMLElement | null>) => {
  useReshapeCommand(
    ref,
    'formatEm',
    ['ctrl + i', 'cmd + i'],
    component,
  );
};

export default extend(
  Em,
  withName('Em'),
  { is: compile('em') },
  withCommands([
    useEmCommand,
    createReshapePatternHook(
      component,
      // eslint-disable-next-line prefer-named-capture-group -- ok for now
      /(?:^|\s)(_(?!\s)([^_]*[^\s_])_)\s?$/g,
    ),
    createReshapePatternHook(
      component,
      // eslint-disable-next-line prefer-named-capture-group -- ok for now
      /(?:^|\s)(\*(?!\s)([^*]*[^\s*])\*)\s?$/g,
    ),
  ]),
);
