import { useEffect, useRef } from 'react';

import { type Command } from './models';
import { type OnChange } from '../changes';
import { useBrickContext } from '../hooks';
import assert from 'assert';

export const useCustomCommands = (
  handlers: Command[],
  onChange?: OnChange,
) => {
  const ref = useRef<HTMLElement>();
  const { subscribeCommand } = useBrickContext();
  const commandsRef = useRef(handlers);
  commandsRef.current = handlers;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    assert(ref.current, 'useCommands: ref should be attached to a node');
    return subscribeCommand(
      ref.current,
      () => ({
        handlers: commandsRef.current,
        onChange: onChangeRef.current,
      }),
    );
  }, [subscribeCommand]);

  return ref;
};
