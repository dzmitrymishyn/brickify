import { extend, withName } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren , type RefObject } from 'react';

import { withCommands } from '../commands';
import { useReshapeCommand } from '../hooks/useReshapeCommand';

const Strong: React.FC<PropsWithChildren> = ({ children }) => (
  <strong>{children}</strong>
);

const useStrongCommand = (ref: RefObject<Node | null>) => {
  useReshapeCommand(
    ref,
    'reshape',
    ['ctrl + b', 'cmd + b'],
    {
      selector: 'strong',
      create: () => document.createElement('strong'),
    },
  );
};

export default extend(
  Strong,
  withName('Strong'),
  { is: compile('strong') },
  withCommands(useStrongCommand),
);
