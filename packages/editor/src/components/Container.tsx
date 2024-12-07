import {
  useMergedRefs,
} from '@brickifyio/core';
import {
  extend,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
  withSlots,
} from '@brickifyio/renderer';
import { type FC, type PropsWithChildren, useState } from 'react';
import { PropsWithChange } from '../changes';

type Props = PropsWithStoredValue & PropsWithChange & PropsWithChildren;

const Container: FC<Props> = ({ children, stored, onChange }) => {
  const [visible, setVisible] = useState(true);

  const ref = useMergedRefs(
    useRendererRegistry(stored),
    // useMutation((mutation) => {
    //   if (mutation.remove) {
    //     return onChange?.({ type: 'remove', path: brick.pathRef.current() });
    //   }
    // }),
  );

  return (
    <div
      ref={ref}
      data-brick="container"
      style={{ width: 500, margin: '0 auto' }}
    >
      <button type="button" onClick={() => {
        onChange?.({
          type: 'update',
          path: stored.pathRef.current(),
          value: {
            ...stored.value,
            visible: !stored.value.visible,
          },
        });
      }}>test</button>
      {/* <button type="button" onClick={() => setVisible(!visible)}>test</button> */}
      {stored.value.visible ? children : null}
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
