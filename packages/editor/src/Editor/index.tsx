import {
  type Component,
  extend,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickContext,
  useBrickRegistry,
  useBricksBuilder,
  useCommands,
  useMergedRefs,
  withBrickContext,
  withBrickName,
} from '@brickifyio/core';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
} from 'react';

type Props = PropsWithBrick & PropsWithChange & {
  value: object[];
  bricks?: Component[];
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  brick,
  onChange: onChangeProp,
}, refProp) => {
  const { editable, onChange } = useBrickContext();
  const { ref: brickRef } = useBrickRegistry(brick);

  const components = useBricksBuilder(
    brick,
    value,
    bricks,
    onChange ?? onChangeProp,
  );

  const ref = useMergedRefs(
    brickRef,
    refProp,
    useCommands(bricks),
  );

  return (
    <div
      ref={ref}
      data-brick="editor"
      {...editable && {
        contentEditable: true,
        suppressContentEditableWarning: true,
      }}
    >
      {components}
    </div>
  );
});

Editor.displayName = 'Editor';

export default pipe(
  extend(Editor, withBrickName('Editor')),
  withBrickContext,
);

export { Editor as EditorWithoutContext };
