import { useEffect, useRef } from 'react';

import { type Command } from './models';
import { useCommandsController } from './useCommandsPluginFactory';
import assert from 'assert';

export const useCustomCommands = (
  handlers: Command[],
) => {
  const ref = useRef<HTMLElement>();
  const { subscribe } = useCommandsController();

  const commandsRef = useRef(handlers);
  commandsRef.current = handlers;

  useEffect(() => {
    assert(
      ref.current,
      'ref for useCustomCommands should be attached to a node',
    );

    return subscribe(
      ref.current,
      commandsRef.current ?? [],
    );
  }, [subscribe]);

  return ref;
};
