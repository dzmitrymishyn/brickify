import {
  extend,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickRegistry,
  useChildRenderer,
  useCommands,
  useMergedRefs,
  useMutation,
  withName,
  withSlots,
} from '@brickifyio/core';
import { type FC, type PropsWithChildren, useState } from 'react';

import Paragraph from '../Paragraph';

type Props = PropsWithBrick & PropsWithChange & PropsWithChildren;

export const Test = extend(
  ({ brick, value, test, onChange }: PropsWithBrick & PropsWithChange & { test: string; value: string }) => {
    const ref = useBrickRegistry(brick);
    const utils = useChildRenderer(brick, 'value', value, (childBrick) => (
      <Paragraph
        brick={childBrick}
        value={childBrick.value.value}
        onChange={(change) => onChange?.({
          ...change,
          value: change.value?.value ?? '',
        })}
        style={{ background: '#ccc' }}
      />
    ));
    const view = useChildRenderer(brick, 'test', test, (childBrick) => (
      <Paragraph
        brick={childBrick}
        value={childBrick.value.value}
        onChange={(change) => {
          return onChange?.({
            ...change,
            value: change.value?.value ?? '',
          });
        }}
        style={{ background: '#aaa' }}
      />
    ));

    return (
      <div
        ref={ref}
        data-brick="test"
        contentEditable={false}
        style={{ display: 'flex', gap: '16px' }}
      >
        {utils}
        <div>SOME OTHER TEXT</div>
        {view}
      </div>
    );
  },
  withName('Test'),
);

const Container: FC<Props> = ({ children, brick, onChange }) => {
  const [visible, setVisible] = useState(true);

  const ref = useMergedRefs(
    useBrickRegistry(brick),
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChange?.({ type: 'remove', path: brick.pathRef.current() });
      }
    }),
    // useCommands(Object.values(brick?.slotsMap?.children ?? {})),
  );

  return (
    <div
      ref={ref}
      data-brick="container"
      style={{ width: 500, margin: '0 auto' }}
    >
      <button type="button" onClick={() => setVisible(!visible)}>test</button>
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
