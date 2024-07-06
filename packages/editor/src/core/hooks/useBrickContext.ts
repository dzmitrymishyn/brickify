import { flow } from 'fp-ts/lib/function';
import { useContext } from 'react';

import { BrickContext } from '../context/BrickContext';
import assert from 'assert';

export const useBrickContextUnsafe = () => useContext(BrickContext);

export const useBrickContext = () => {
  const context = useBrickContextUnsafe();

  assert(context, 'Brick context should be specify');

  return context;
};

export const useLogger = flow(
  useBrickContext,
  ({ logger }) => logger,
);
