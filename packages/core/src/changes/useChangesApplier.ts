import { useEffect, useRef } from 'react';

import { useBrickContext } from '../hooks';
import assert from 'assert';

export const useChangesApplier = (applyChanges: () => void) => {
  const ref = useRef<HTMLElement>(null);
  const { changes: { subscribeApply } } = useBrickContext();
  const subscriberRef = useRef<() => void>();

  subscriberRef.current = applyChanges;

  useEffect(() => {
    assert(ref.current, 'useChangesApplier: ref should be attached to a node');

    return subscribeApply(ref.current, () => subscriberRef.current?.());
  }, [subscribeApply]);

  return ref;
};
