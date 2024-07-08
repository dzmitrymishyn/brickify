import { match } from '@brickifyio/browser/hotkeys';
import { useEffect, useRef } from 'react';

import { useBrickContextUnsafe } from './useBrickContext';
import assert from 'assert';

export const useDisallowHotkeys = (disallowList: string[] = []) => {
  const hasInheritedContext = Boolean(useBrickContextUnsafe());
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hasInheritedContext) {
      return;
    }

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
  }, [disallowList, hasInheritedContext]);

  return ref;
};
