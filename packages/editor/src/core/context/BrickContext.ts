import { createContext } from 'react';

import { type BrickContextType } from './models';

export const BrickContext = createContext<BrickContextType | null>(null);

BrickContext.displayName = 'BrickContext';
