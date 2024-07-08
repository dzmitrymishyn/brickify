import { match } from '@brickifyio/browser/hotkeys';
import { useEffect, useRef } from 'react';

export const useDisallowHotkeys = (disallowList: string[] = []) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

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
