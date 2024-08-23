import {
  type BrickValue,
  type Component,
  extend,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickContext,
  useBrickRegistry,
  useCommands,
  useMergedRefs,
  useRenderer,
  withBrickContext,
  withBrickName,
} from '@brickifyio/core';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
} from 'react';

type Props = PropsWithBrick<BrickValue | BrickValue[]> & PropsWithChange & {
  value: BrickValue[];
  bricks?: Component[];
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  brick,
  onChange,
  style,
}, refProp) => {
  const { editable } = useBrickContext();

  const ref = useMergedRefs(
    refProp,
    useBrickRegistry(brick),
    useCommands(bricks),
  );

  const nodes = useRenderer(brick, value, bricks, onChange);

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
      {nodes}
    </div>
  );
});

Editor.displayName = 'Editor';

export default pipe(
  extend(Editor, withBrickName('Editor')),
  withBrickContext,
);

export { Editor as EditorWithoutContext };
