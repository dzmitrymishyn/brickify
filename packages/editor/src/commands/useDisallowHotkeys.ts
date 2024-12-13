import { match } from '@brickifyio/browser/hotkeys';
import { useRendererContextUnsafe } from '@brickifyio/renderer';
import { type RefObject, useEffect } from 'react';

import assert from 'assert';

export const useDisallowHotkeys = (
  ref: RefObject<Node | null>,
  disallowList: string[] = [],
) => {
  const hasInheritedContext = Boolean(useRendererContextUnsafe());

  assert(
    !hasInheritedContext,
    'Usage of useDisallowHotkeys inside RenderedContext can cause '
      + 'unpredictable behavior',
  );

  useEffect(() => {
    assert(
      ref.current,
      'Cannot disable shortcuts: the node is not rendered or ref is not '
        + 'attached.'
    );

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
  }, [disallowList, ref]);
};
