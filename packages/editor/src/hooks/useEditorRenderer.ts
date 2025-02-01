import {
  useRenderer,
  type UseRendererOptions,
} from '@brickifyio/renderer';
import { useLayoutEffect } from 'react';

export const useEditorRenderer = (options: UseRendererOptions) => {
  const [elements, diff] = useRenderer(options);

  useLayoutEffect(() => {
    if (diff) {
      // TODO: commit history changes
    }
  }, [diff]);

  return elements;
};
