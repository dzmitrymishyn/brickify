import { ReactElement } from 'react';

import { Brick, BrickValue } from '../../utils';

export type BrickCacheValue = {
  element: ReactElement;
  Component: Brick;
  value: BrickValue<string | Symbol> & Record<string, unknown>;
};
