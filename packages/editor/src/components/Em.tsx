// import { reshape } from '@brickifyio/browser/manipulations';
// import { extend, withShortcuts } from '@brickifyio/core';
import { extend } from '@brickifyio/renderer';
import { compile } from 'css-select';
import React, { type PropsWithChildren } from 'react';


const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(
  Em,
  { is: compile('em') },
  // withShortcuts([
  //   {
  //     name: 'reshape',
  //     shortcuts: ['ctrl + i', 'cmd + i'],
  //     handle: ({ range, target, results }) => {
  //       const previousReshape = results('reshape');

  //       const { type, range: newRange } = reshape(
  //         {
  //           selector: 'em',
  //           create: () => document.createElement('em'),
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
