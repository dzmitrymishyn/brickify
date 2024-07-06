import { useEffect, useRef } from 'react';

import { type BeforeAfterRangesController } from './useBeforeAfterRanges';
import { useBrickContextUnsafe } from './useBrickContext';

export const useRangeSaver = (
  rangesController: BeforeAfterRangesController,
) => {
  const inheritedContext = useBrickContextUnsafe();
  const hasInheritedContext = Boolean(inheritedContext);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || hasInheritedContext) {
      return;
    }

    const element: Element = ref.current;
    const events = [
      'keydown', 'keyup', 'input', 'change', 'paste', 'cut', 'click',
      'dblclick', 'drop', 'beforeInput',
    ];

    const saveSelection = () => {
      rangesController.saveBefore();
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
  }, [hasInheritedContext, rangesController]);

  return ref;
};
