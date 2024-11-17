import { useContext } from 'react';

import { RendererContext } from './RendererContext';
import assert from 'assert';

export const useRendererContextUnsafe = () => useContext(RendererContext);

export const useRendererContext = () => {
  const context = useRendererContextUnsafe();

  assert(context, 'useRendererContext must be used within a RendererContext');

  return context;
};
