import { reshape } from '@brickifyio/browser/manipulations';
import { compile } from 'css-select';
import React from 'react';
import { type PropsWithChildren } from 'react';

import { extend } from '../bricks';
import { shortcuts } from '../bricks/utils/shortcuts';

const Strong: React.FC<PropsWithChildren> = ({ children }) => (
  <strong>{children}</strong>
);

export default extend(
  Strong,
  { is: compile('strong') },
  shortcuts({
    reshape: {
      shortcuts: ['ctrl + b', 'cmd + b'],
      handle: ({ range, element, results }) => {
        const previousReshape = results('reshape');

        const { type, range: newRange } = reshape(
          {
            selector: 'strong',
            create: () => document.createElement('strong'),
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
