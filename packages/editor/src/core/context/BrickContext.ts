import { flow } from 'fp-ts/lib/function';
import { createContext, useContext } from 'react';

import { type Logger } from '../logger';
import assert from 'assert';

type BrickContextType = {
  logger: Logger;
};

export const BrickContext = createContext<BrickContextType | null>(null);

export const useBrickContext = () => {
  const context = useContext(BrickContext);

  assert(context, 'Brick context should be specify');

  return context;
};


export const useLogger = flow(
  useBrickContext,
  ({ logger }) => logger,
);
