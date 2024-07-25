import { forwardRef, type PropsWithChildren } from 'react';

import {
  extend,
  type PropsWithChange,
  useMutation,
  withSlots,
} from '../core';
import { useMergedRefs } from '../utils';

type Props = PropsWithChildren & PropsWithChange;

const Container = forwardRef<Node, Props>(({ children, onChange }, refProp) => {
  const mutationRef = useMutation<HTMLDivElement>(({ remove }) => {
    if (remove) {
      return onChange?.({ type: 'remove' });
    }
  });

  const ref = useMergedRefs(refProp, mutationRef);

  return (
    <div ref={ref} style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default extend(
  Container,
  withSlots({ children: 'inherit' }),
);
