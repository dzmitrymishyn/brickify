import { reshape } from '@brickifyio/browser/manipulations';
// import { extend, withShortcuts } from '@brickifyio/core';
import { extend, withName } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren, type RefObject } from 'react';

import { useCommand } from '../commands';


const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

const useEmCommand = (ref: RefObject<Node | null>) => {
  useCommand(ref, {
    name: 'reshape',
    shortcuts: ['ctrl + i', 'cmd + i'],
    handle: ({ range, target, results }) => {
      const previousReshape = results('reshape');

      const { type, range: newRange } = reshape(
        {
          selector: 'em',
          create: () => document.createElement('em'),
        },
        range()!,
        target as HTMLElement,
        previousReshape as 'expose' | 'surround',
      );

      if (newRange) {
        range(newRange);
      }

      results({ reshape: type });
    },
  });
};

export default extend(
  Em,
  withName('Em'),
  { is: compile('em') },
  {
    commands: useEmCommand,
  },
);
