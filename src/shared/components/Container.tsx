import { PropsWithChildren } from 'react';

import { component, make, slots } from '@/shared/bricks';

export default make(
  component('container', ({ children }: PropsWithChildren) => (
    <div style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  )),
  slots(['children']),
);
