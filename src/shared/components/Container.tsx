import React, { PropsWithChildren } from 'react';

import { PropsWithBrick, PropsWithChange, extend, slots, useMutation } from '@/shared/bricks';

type Props = PropsWithChildren & PropsWithBrick & PropsWithChange;

const Container: React.FC<Props> = ({ children, onChange }) => {
  const mutationRef = useMutation<HTMLDivElement>({
    mutate: ({ remove }: any) => {
      if (remove) {
        return onChange?.(null, { type: 'remove' });
      }
    },
  } as any);

  return (
    <div ref={mutationRef} style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  );
}

Container.displayName = 'Container';

export default extend(
  Container,
  slots({ children: 'inherit' }),
);
