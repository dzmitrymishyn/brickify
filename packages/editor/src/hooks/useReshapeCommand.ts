import {
  getReshapeType,
  reshape, type ReshapeVariant,
} from '@brickifyio/browser/manipulations';
import {
  fromCustomRange,
  getRange,
  restoreRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { type RefObject } from 'react';

import { useCommand } from '../commands';

export const useReshapeCommand = (
  ref: RefObject<Node | null>,
  name: string,
  shortcuts: string[],
  componentHelpers: {
    selector: string;
    create: () => Element;
  },
) => {
  useCommand(ref, {
    name,
    shortcuts,
    handle({ range, target, results, postpone }) {
      const previousReshape = results<ReshapeVariant | undefined>('reshape')
        ?? getReshapeType(componentHelpers, range, target as HTMLElement);

      if (range.collapsed) {
        const previousCustomRange = toCustomRange(target)(range);

        postpone({
          action: () => {
            if (!previousCustomRange) {
              return;
            }

            const { range: nextRange } = reshape(
              componentHelpers,
              fromCustomRange({
                ...previousCustomRange,
                startPath: {
                  ...previousCustomRange.startPath,
                  offsetCase: 'start',
                },
                endPath: {
                  ...previousCustomRange.endPath,
                  offset: previousCustomRange.endPath.offset + 1,
                  offsetCase: 'end',
                },
              })!,
              target as HTMLElement,
              previousReshape,
            );

            nextRange.collapse();

            restoreRange(nextRange);
          },
          condition: (type) => {
            const newRange = getRange();
            const offset = toCustomRange(target)(newRange)?.startPath?.offset;

            return (
              type === 'mutation'
              && newRange?.collapsed
              && typeof previousCustomRange?.startPath?.offset === 'number'
              && previousCustomRange.startPath.offset + 1 === offset
            ) ? true : 'ignore';
          },
        });
        return;
      }

      const { type, range: nextRange } = reshape(
        componentHelpers,
        range,
        target as HTMLElement,
        previousReshape,
      );

      if (nextRange) {
        range.setStart(nextRange.startContainer, nextRange.startOffset);
        range.setEnd(nextRange.endContainer, nextRange.endOffset);
      }

      results({ reshape: type });
    },
  });
};
