import { match } from '@brickifyio/browser/hotkeys';
import { useEffect, useRef } from 'react';

import { useBrickContextUnsafe } from './useBrickContext';
import assert from 'assert';

export const useDisallowHotkeys = (disallowList: string[] = []) => {
  const ref = useRef<HTMLElement>(null);
  const hasInheritedContext = Boolean(useBrickContextUnsafe());

  assert(
    !hasInheritedContext,
    'Usage of useDisallowHotkeys inside BrickContext can cause unpredictable behavior',
  );

  useEffect(() => {
    assert(ref.current, 'useRangeSaver: ref should be attached to a node');

    const element = ref.current;
    const handleKeydown = (event: Event) => {
      disallowList.find((shortcut) => {
        if (match(event, shortcut)) {
          event.preventDefault();
          return true;
        }
        return false;
      });
    };

    element.addEventListener('keydown', handleKeydown);
    return () => element.removeEventListener('keydown', handleKeydown);
  }, [disallowList]);

  return ref;
};
