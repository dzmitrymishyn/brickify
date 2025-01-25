import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type RefObject, useEffect } from 'react';

import { type ComponentMutationsHandler } from './mutations';
import { useMutationsPlugin } from './useMutationsPluginFactory';
import assert from 'assert';

export const useMutation = <Results extends object = object>(
  ref: RefObject<Node | null>,
  mutate: ComponentMutationsHandler<Results>,
) => {
  const { markToRevert, subscribe } = useMutationsPlugin();
  const mutateRef = useSyncedRef(mutate);

  useEffect(() => {
    assert(
      ref.current,
      'Cannot track mutations: the node is not rendered or ref is not '
        + 'attached.',
    );

    return subscribe(
      ref.current,
      // Each time we can use new function
      (mutation) => mutateRef.current?.(mutation),
    );
  }, [subscribe, mutateRef, ref]);

  return { markToRevert };
};
