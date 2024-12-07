import { useSyncedRef } from '@brickifyio/utils/hooks';
import { useEffect, useRef } from 'react';

import { useChanges } from './useChangesPluginFactory';
import assert from 'assert';

export const useChangesApplier = (applyChanges: () => void) => {
  const ref = useRef<HTMLElement>(null);
  const { subscribeApply } = useChanges();
  const subscriberRef = useSyncedRef(applyChanges);

  useEffect(() => {
    assert(ref.current, 'useChangesApplier: ref should be attached to a node');

    return subscribeApply(ref.current, () => subscriberRef.current?.());
  }, [subscribeApply, subscriberRef]);

  return ref;
};
