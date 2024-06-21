import { type CustomRange } from '@brickifyio/browser/selection';
import { createContext } from 'react';

import { type Mutation } from './mutations';

type Unsubscribe = () => void;

type Subscribe = (
  element: HTMLElement,
  mutate: (mutation: Mutation) => void,
) => Unsubscribe;

export type HandleResults = (updatedValues: unknown[]) => void;

export type MutationsContextType = {
  subscribe: Subscribe;
  // TODO: Come up with fine name
  clear: () => void;
  trackChange: <T>(change: T) => T;
  afterMutationRange: () => CustomRange | null | undefined;
};

export const MutationsContext = createContext<MutationsContextType | null>(null);

MutationsContext.displayName = 'MutationsContext';
