// import { reshape } from '@brickifyio/browser/manipulations';
// import { extend, withShortcuts } from '@brickifyio/core';
import { extend } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React from 'react';
import { type PropsWithChildren } from 'react';

const Strong: React.FC<PropsWithChildren> = ({ children }) => (
  <strong>{children}</strong>
);

export default extend(
  Strong,
  { is: compile('strong') },
  // withShortcuts([
  //   {
  //     name: 'reshape',
  //     shortcuts: ['ctrl + b', 'cmd + b'],
  //     handle: ({ range, target, results }) => {
  //       const previousReshape = results('reshape');

  //       const { type, range: newRange } = reshape(
  //         {
  //           selector: 'strong',
  //           create: () => document.createElement('strong'),
  //         },
  //         range()!,
  //         target as HTMLElement,
  //         previousReshape as 'expose' | 'surround',
  //       );

  //       if (newRange) {
  //         range(newRange);
  //       }

  //       results({ reshape: type });
  //     },
  //   },
  // ]),
);
