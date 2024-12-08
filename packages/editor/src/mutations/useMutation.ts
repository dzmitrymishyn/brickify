import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type RefObject, useEffect } from 'react';

import { type ComponentMutationsHandler } from './mutations';
import { useMutationsController } from './useMutationsPluginFactory';
import assert from 'assert';

export const useMutation = (
  ref: RefObject<Node | null>,
  mutate: ComponentMutationsHandler,
) => {
  const controller = useMutationsController();
  const mutateRef = useSyncedRef(mutate);

  useEffect(() => {
    assert(
      ref.current,
      'Cannot track mutations: the node is not rendered or ref is not '
        + 'attached.',
    );

    return controller.subscribe(
      ref.current,
      // Each time we can use new function
      (mutation) => mutateRef.current?.(mutation),
    );
  }, [controller, mutateRef, ref]);

  return controller;
};
