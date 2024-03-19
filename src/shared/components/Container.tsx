import React, { PropsWithChildren } from 'react';

import { extend, slots } from '@/shared/bricks';

const Container: React.FC<PropsWithChildren> = ({ children }) => (
  <div style={{ margin: '0 auto', maxWidth: 600 }}>
    {children}
  </div>
);

export default extend(
  Container,
  slots({ children: 'inherit' }),
);
