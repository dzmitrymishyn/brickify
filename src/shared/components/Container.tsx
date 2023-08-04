import { PropsWithChildren } from 'react';

import { addSlots, component, make } from '@/shared/bricks';

export default make(
  component('container', ({ children }: PropsWithChildren) => (
    <div style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  )),
  addSlots({ children: 'inherit' }),
);
