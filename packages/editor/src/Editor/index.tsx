import {
  type BrickValue,
  type Component,
  // extend,
  // type PropsWithBrick,
  type PropsWithChange,
  // useBrickContext,
  // useBrickRegistry,
  // useCommands,
  // useMergedRefs,
  // useRenderer,
  // withBrickContext,
  // withBrickName,
} from '@brickifyio/core';
import {
  extend,
  type PropsWithStoredValue,
  useMergedRefs,
  useRenderer,
  useRendererRegistry,
  withName,
  withRendererContext,
} from '@brickifyio/renderer';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
} from 'react';

type Props = PropsWithStoredValue<BrickValue[]> & PropsWithChange & {
  // value: BrickValue[];
  components?: Component[];
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  components = [],
  stored,
  onChange,
  style,
}, refProp) => {
  // const { editable } = useRendererContext();
  const editable = true;

  const ref = useMergedRefs(
    refProp,
    // useBrickRegistry(storedValue),
    useRendererRegistry(stored),
    // useCommands(bricks),
  );

  const { value } = useRenderer({
    slotsValue: { value: stored.value },
    slotsMeta: { value: components },
    props: { onChange },
  });

  return (
    <div
      ref={ref}
      data-brick="editor"
      style={style}
      {...editable && {
        contentEditable: true,
        suppressContentEditableWarning: true,
      }}
    >
      {value}
    </div>
  );
});

export default pipe(
  extend(Editor, withName('Editor')),
  withRendererContext,
);

export { Editor as EditorWithoutContext };
