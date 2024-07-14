import { reshape } from '@brickifyio/browser/manipulations';
import { compile } from 'css-select';
import React, { type PropsWithChildren } from 'react';

import { extend, withShortcuts } from '../core';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(
  Em,
  { is: compile('em') },
  withShortcuts({
    reshape: {
      shortcuts: ['ctrl + i', 'cmd + i'],
      handle: ({ range, element, results }) => {
        const previousReshape = results('reshape');

        const { type, range: newRange } = reshape(
          {
            selector: 'em',
            create: () => document.createElement('em'),
          },
          range()!,
          element as HTMLElement,
          previousReshape as 'expose' | 'surround',
        );

        if (newRange) {
          range(newRange);
        }

        results({ reshape: type });
      },
    },
  }),
);
