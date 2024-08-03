import { useEffect, useRef } from 'react';

import { type BeforeAfterRangesController } from './useBeforeAfterRanges';
import { useBrickContextUnsafe } from '../hooks/useBrickContext';
import assert from 'assert';

export const useRangeSaver = (
  rangesController: BeforeAfterRangesController,
) => {
  const hasInheritedContext = Boolean(useBrickContextUnsafe());
  const ref = useRef<HTMLElement>(null);

  assert(
    !hasInheritedContext,
    'Usage of useRangeSaver inside BrickContext can cause unpredictable behavior',
  );

  useEffect(() => {
    assert(ref.current, 'useRangeSaver: ref should be attached to a node');

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
  }, [rangesController]);

  return ref;
};
