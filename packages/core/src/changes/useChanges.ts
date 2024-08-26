import {
  type ChangesController,
  changesToken,
} from './useChangesPluginFactory';
import { createUsePlugin } from '../plugins';

export const useChanges = createUsePlugin<ChangesController>(changesToken);
