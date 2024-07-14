import { useEffect, useRef } from 'react';

import { type HandleCommand, type HandleCommandOptions } from './models';
import { useBrickContext } from '../hooks';
import assert from 'assert';

export type Command<Name extends string> = {
  name: Name;
  shortcuts?: string[];
  handle?: (options: HandleCommandOptions) => void;
};

export type Commands<C extends Command<string>> = {
  [K in C['name']]: Omit<Extract<C, { name: K }>, 'name'>;
};

export const useCustomCommands = (
  handle: HandleCommand,
) => {
  const ref = useRef<HTMLElement>();
  const { subscribeCommand } = useBrickContext();
  const commandHandleRef = useRef(handle);

  commandHandleRef.current = handle;

  useEffect(() => {
    assert(ref.current, 'useCommands: ref should be attached to a node');
    return subscribeCommand(
      ref.current,
      (options) => commandHandleRef.current?.(options),
    );
  }, [subscribeCommand]);

  return ref;
};
