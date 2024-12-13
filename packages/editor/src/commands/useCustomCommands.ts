import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type RefObject, useEffect } from 'react';

import { type Command } from './models';
import { useCommandsController } from './useCommandsPluginFactory';
import assert from 'assert';

export const useCustomCommands = (
  ref: RefObject<Node | null>,
  handlers: Command[],
) => {
  const { subscribe } = useCommandsController();
  const commandsRef = useSyncedRef(handlers);

  useEffect(() => {
    assert(
      ref.current,
      'ref for useCustomCommands should be attached to a node',
    );

    return subscribe(
      ref.current,
      commandsRef.current ?? [],
    );
  }, [subscribe, commandsRef, ref]);

  return ref;
};
