import { type PluginMap } from '@brickifyio/renderer';
import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type RefObject, useEffect } from 'react';

import { type Command } from './models';
import { useCommandsPlugin } from './useCommandsPluginFactory';
import assert from 'assert';

export const useCommand = (
  ref: RefObject<Node | null>,
  handler: Command,
  pluginMap?: PluginMap,
) => {
  const { subscribe } = useCommandsPlugin(pluginMap);
  const commandRef = useSyncedRef(handler);

  useEffect(() => {
    assert(
      ref.current,
      'ref for useCustomCommands should be attached to a node',
    );

    return subscribe(
      ref.current,
      commandRef.current ? [commandRef.current] : [],
    );
  }, [subscribe, commandRef, ref]);
};
