import { extend, withName } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren, type RefObject } from 'react';

import { withCommands } from '../commands';
import { useReshapeCommand } from '../hooks/useReshapeCommand';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

const useEmCommand = (ref: RefObject<Node | null>) => {
  useReshapeCommand(
    ref,
    'reshape',
    ['ctrl + i', 'cmd + i'],
    {
      selector: 'em',
      create: () => document.createElement('em'),
    },
  );
};

export default extend(
  Em,
  withName('Em'),
  { is: compile('em') },
  withCommands(useEmCommand),
);
