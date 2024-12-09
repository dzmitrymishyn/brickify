import { getRangeCopy } from '@brickifyio/browser/selection';
import { useRendererContextUnsafe } from '@brickifyio/renderer';
import { type RefObject, useEffect } from 'react';

import { RangeType, type SelectionController } from '../selection';

export const useBeforeMutationRangeSaver = (
  ref: RefObject<Node | null>,
  selectionController: SelectionController,
) => {
  const hasInheritedContext = useRendererContextUnsafe();

  useEffect(() => {
    if (!ref.current || hasInheritedContext) {
      // TODO: Warn the usage
      return;
    }

    const element = ref.current;
    const events = [
      'keydown', 'keyup', 'input', 'change', 'paste', 'cut', 'click',
      'dblclick', 'drop', 'beforeInput',
    ];

    const saveSelection = () => {
      selectionController.range.save(RangeType.Temp, getRangeCopy());
    };

    // Add event listeners to save the selection range before any mutation
    events.forEach(
      (event) => element.addEventListener(event, saveSelection, true),
    );

    return () => {
      events.forEach(
        (event) => element.removeEventListener(event, saveSelection, true),
      );
    };
  }, [ref, hasInheritedContext, selectionController]);
};
