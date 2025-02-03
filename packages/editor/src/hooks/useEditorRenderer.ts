import { array } from '@brickifyio/operators';
import {
  useRenderer,
  type UseRendererOptions,
} from '@brickifyio/renderer';
import { useLayoutEffect } from 'react';

import { useHistoryPlugin } from '../history';

export const useEditorRenderer = (options: UseRendererOptions) => {
  const [elements, diff] = useRenderer(options);

  const { commit } = useHistoryPlugin();

  useLayoutEffect(() => {
    if (diff) {
      commit({
        undo: array(diff.undo),
        redo: array(diff.redo),
      });
    }
  }, [diff, commit]);

  return elements;
};
