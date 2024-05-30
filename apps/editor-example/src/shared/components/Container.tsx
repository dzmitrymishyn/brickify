import React, { type PropsWithChildren } from 'react';

import {
  extend,
  type PropsWithBrick,
  type PropsWithChange,
  slots,
  useMutation,
} from '@/shared/bricks';

type Props = PropsWithChildren & PropsWithBrick & PropsWithChange;

const Container: React.FC<Props> = ({ children, onChange }) => {
  const mutationRef = useMutation<HTMLDivElement>({
    /* eslint @typescript-eslint/no-unsafe-argument: off -- the type will be updated */
    /* eslint @typescript-eslint/no-explicit-any: warn -- the type will be updated */
    mutate({ remove }: any) {
      if (remove) {
        return onChange?.(null, { type: 'remove' });
      }

      return undefined;
    },
  } as any);

  return (
    <div ref={mutationRef} style={{ margin: '0 auto', maxWidth: 600 }}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';

export default extend(
  Container,
  slots({ children: 'inherit' }),
);
