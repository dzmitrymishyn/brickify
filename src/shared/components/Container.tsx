import { PropsWithChildren } from 'react';

import {
  addCustomChildren,
  addSlots,
  component,
  make,
} from '@/shared/bricks';

export default make(
  component('container', ({ children }: PropsWithChildren) => (
    <div style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  )),
  addSlots({ children: 'inherit' }),
  addCustomChildren(
    (value) => (
      typeof value === 'string' ? {
        brick: 'paragraph',
        children: value,
      } : null
    ),
  ),
);
