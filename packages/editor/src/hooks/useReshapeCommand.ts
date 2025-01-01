import { reshape, type ReshapeVariant } from '@brickifyio/browser/manipulations';
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
    handle({ range, target, results }) {
      const previousReshape = results<ReshapeVariant | undefined>('reshape');

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
