import {
  type Component,
  extend,
  useBrickContext,
  useBrickRegistry,
  useBricksBuilder,
  useMergedRefs,
  withBrickContext,
  withBrickName,
} from '@brickifyio/core';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
} from 'react';

type Props = {
  value: object[];
  bricks?: Component[];
  brick: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  brick,
}, refProp) => {
  const { editable, onChange } = useBrickContext();
  const { ref: brickRef } = useBrickRegistry(brick);

  const components = useBricksBuilder(
    brick,
    value,
    bricks,
    onChange,
  );

  const ref = useMergedRefs(
    brickRef,
    refProp,
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
