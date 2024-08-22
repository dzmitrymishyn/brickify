import { type ReactElement } from 'react';

import { type PropsWithBrick } from '../components';

export * from './models';
export * from './useChangesApplier';

export const plugin = {
  render: (element: ReactElement<PropsWithBrick>) => {
    return element;
  },
};
