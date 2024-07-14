import React, { type PropsWithChildren } from 'react';

import {
  type PropsWithBrick,
} from '../bricks';
import { extend, type PropsWithChange, useMutation, withSlots } from '../core';

type Props = PropsWithChildren & PropsWithBrick & PropsWithChange;

const Container: React.FC<Props> = ({ children, onChange }) => {
  const mutationRef = useMutation<HTMLDivElement>(({ remove }) => {
    if (remove) {
      return onChange?.({ type: 'remove' });
    }
  });

  return (
    <div ref={mutationRef} style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export default extend(
  Container,
  withSlots({ children: 'inherit' }),
);
