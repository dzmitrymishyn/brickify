import {
  extend,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
  withSlots,
} from '@brickifyio/renderer';
import { type FC, type PropsWithChildren } from 'react';

import { type PropsWithChange } from '../changes';
import { useMutation } from '../mutations';

type Props = PropsWithStoredValue & PropsWithChange<{visible: boolean}> & PropsWithChildren & {
  visible: boolean;
};

const Container: FC<Props> = ({ children, visible, stored, onChange }) => {
  const ref = useRendererRegistry<HTMLDivElement>(stored);
  const { markToRevert } = useMutation(ref, ({ mutations }) => {
    markToRevert(mutations);
  });

  return (
    <div
      ref={ref}
      data-brick="container"
      style={{ width: 500, margin: '0 auto' }}
    >
      <button type="button" onClick={() => {
        onChange?.({ visible: !visible });
      }}>test</button>
      {visible ? children : null}
    </div>
  );
};

export default extend(
  Container,
  withSlots({
    children: 'inherit',
  }),
  withName('Container'),
);
