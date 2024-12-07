import { useSyncedRef } from '@brickifyio/utils/hooks';
import { useRef } from 'react';

// import { useChanges } from './useChangesPluginFactory';
// import assert from 'assert';

export const useChangesApplier = (applyChanges: () => void) => {
  const ref = useRef<HTMLElement>(null);
  // const { subscribeApply } = useChanges();
  const subscriberRef = useSyncedRef<() => void>(applyChanges);

  // Just for usage
  subscriberRef;

  // useEffect(() => {
  //   assert(ref.current, 'useChangesApplier: ref should be attached to a node');

  //   // return subscribeApply(ref.current, () => subscriberRef.current?.());
  // }, [subscribeApply]);

  return ref;
};
