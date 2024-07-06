// import { useContext, useEffect, useRef } from 'react';

// import { MutationsContext } from '../mutations';

export type Command<Name extends string> = {
  name: Name;
  shortcut?: string[];
  handle?: (range: Range) => void;
};

export type Commands<C extends Command<string>> = {
  [K in C['name']]: Omit<Extract<C, { name: K }>, 'name'>;
};

// Use a mapped type to ensure only valid command keys are used
export const useCommands = (
  _handle: () => void,
) => {
  // const context = useContext(MutationsContext)!;
  // const commandHandleRef = useRef(handle);

  // commandHandleRef.current = handle;

  // useEffect(() => context.registerCommand(() => {
  //   commandHandleRef.current?.();
  // }), [context]);
};
