import { createContext } from 'react';

import { type PluginMap } from '../plugins';
import { type RendererStore } from '../store';

export type RendererContextType = {
  store: RendererStore;
  plugins: PluginMap;
};

export const RendererContext = createContext<RendererContextType | null>(null);
