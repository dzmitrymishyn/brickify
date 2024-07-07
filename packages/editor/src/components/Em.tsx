import { expose, reshape, surround } from '@brickifyio/browser/manipulations';
import { compile } from 'css-select';
import React, { type PropsWithChildren } from 'react';

import { extend } from '../bricks';
import { type Command, type Commands } from '../core/commands';

type EmCommand = Command<'reshape'>;

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(
  Em,
  { is: compile('em') },
  {
    commands: {
      reshape: {
        shortcut: ['ctrl + i', 'cmd + i'],
        handle: reshape.bind(null, {
          selector: 'em',
          create: () => document.createElement('em'),
        }),
      },
      surround: {
        handle: surround.bind(null, {
          selector: 'em',
          create: () => document.createElement('em'),
        }),
      },
      expose: {
        handle: expose.bind(null, {
          selector: 'em',
          create: () => document.createElement('em'),
        }),
      },
    } as Commands<EmCommand>,
  },
);

// /**
//  * Check if an element is within a specified Range.
//  * @param {Element} element - The DOM element to check.
//  * @param {Range} range - The Range object defining the start and end points.
//  * @returns {boolean} - `true` if the element is within the range, otherwise `false`.
//  */
// const isElementWithinRange = (element, range) => {
//   return (
//     range.comparePoint(element, 0) <= 0 &&
//     range.comparePoint(element, element.childNodes.length) >= 0
//   );
// };
