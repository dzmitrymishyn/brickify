import { compile } from 'css-select';
import { PropsWithChildren } from 'react';

import { addShortcuts, component, make } from '@/shared/bricks';

export default make(
  component('em', ({ children }: PropsWithChildren) => (
    <em>{children}</em>
  ), {
    is: compile('em'),
  }),
  addShortcuts({}),
);
