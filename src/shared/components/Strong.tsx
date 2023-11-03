import { compile } from 'css-select';
import { PropsWithChildren } from 'react';

import { addShortcuts, component, make } from '@/shared/bricks';

export default make(
  component('strong', ({ children }: PropsWithChildren) => (
    <strong>{children}</strong>
  ), {
    is: compile('strong'),
  }),
  addShortcuts({}),
);
