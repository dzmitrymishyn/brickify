import { useEffect, useRef } from 'react';

import { type Command } from './models';
import { useCommandsController } from './useCommandsPluginFactory';
import { type OnChange } from '../changes';
import assert from 'assert';

export const useCustomCommands = (
  handlers: Command[],
  onChange?: OnChange,
) => {
  const ref = useRef<HTMLElement>();
  const { subscribe } = useCommandsController()!;
  const commandsRef = useRef(handlers);
  commandsRef.current = handlers;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    assert(ref.current, 'useCommands: ref should be attached to a node');
    return subscribe(
      ref.current,
      commandsRef.current ?? [],
    );
  }, [subscribe]);

  return ref;
};
