import { createContext } from 'react';

import { MutationHandler } from './mutations';

type Unsubscribe = () => void;

type Subscribe = (
  element: HTMLElement,
  mutate: MutationHandler,
) => Unsubscribe;

export type HandleResults = (updatedValues: unknown[]) => void;

export type MutationsContextType = {
  subscribe: Subscribe;
  // TODO: Come up with fine name
  clear(): void;
  trackChange<T>(change: T): T;
};

export const MutationsContext = createContext<MutationsContextType | null>(null);

MutationsContext.displayName = 'MutationsContext';
