import { useEffect, useRef } from 'react';

import { useChanges } from './useChanges';
import assert from 'assert';

export const useChangesApplier = (applyChanges: () => void) => {
  const ref = useRef<HTMLElement>(null);
  const { subscribeApply } = useChanges()!;
  const subscriberRef = useRef<() => void>();

  subscriberRef.current = applyChanges;

  useEffect(() => {
    assert(ref.current, 'useChangesApplier: ref should be attached to a node');

    return subscribeApply(ref.current, () => subscriberRef.current?.());
  }, [subscribeApply]);

  return ref;
};
