import { reshape } from '@brickifyio/browser/manipulations';
import { compile } from 'css-select';
import React, { type PropsWithChildren } from 'react';

import { extend } from '../bricks';
import { shortcuts } from '../bricks/utils/shortcuts';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(
  Em,
  { is: compile('em') },
  shortcuts({
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

        return true;
      },
    },
  }),
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
