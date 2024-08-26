import { useChangesPluginFactory } from '../changes';
import { useCommandsPluginFactory } from '../commands';
import { useMutationsPluginFactory } from '../mutations';
import { type UsePluginFactory } from '../plugins';
import { useBeforeAfterRangesPluginFactory } from '../ranges';

export const CommonPlugins: UsePluginFactory[] = [
  useChangesPluginFactory,
  useBeforeAfterRangesPluginFactory,
  useMutationsPluginFactory,
  useCommandsPluginFactory,
];
