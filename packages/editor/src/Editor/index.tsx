import {
  type Change,
  type Component,
  extend,
  useBatchChanges,
  useBrickContext,
  useBrickRegistry,
  useBricksBuilder,
  useCommands,
  useMergedRefs,
  withBrickContext,
  withBrickName,
} from '@brickifyio/core';
import { patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  useCallback,
  useRef,
} from 'react';

type Props = {
  value: object[];
  bricks?: Component[];
  onChange?: (value: unknown) => void;
  brick: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  onChange,
  brick,
}, refProp) => {
  const { editable, store, changes: changesController } = useBrickContext();
  const editorChangesRef = useRef<Change[]>([]);
  const onChangeRef = useRef<(value: unknown) => void>();
  const { ref: brickRef } = useBrickRegistry(brick);

  onChangeRef.current = onChange;

  const emitChange = useCallback((
    changes: Change[],
    brickParam: object,
  ) => {
    const { slotsTreeNode: root, pathRef } = store.get(brickParam)!;
    if (!changes.length || !root) {
      return;
    }

    const newValue = patch(root, changes, pathRef.current()) as {
      value: unknown;
    };

    onChangeRef.current?.({ type: 'update', value: newValue.value });
  }, [store]);

  const components = useBricksBuilder(
    brick,
    value,
    bricks,
    (...changes) => {
      if (!changes.length) {
        return;
      }

      if (changesController.state() === 'interaction') {
        emitChange(changes, brick);
        return;
      }

      // console.log('useBricksBuilder', changes, store.get(brick)?.pathRef.current());
      editorChangesRef.current.push(...changes);
      return changes;
    },
  );

  const batchChangesRef = useBatchChanges({
    apply: () => {
      // console.log('batchChangesRef', editorChangesRef.current, store.get(brick)?.pathRef.current());
      emitChange(editorChangesRef.current, brick);
      editorChangesRef.current = [];
    },
  });

  const commandsRef = useCommands(bricks, (...changes) => {
    // console.log('commandsRef', editorChangesRef.current, store.get(brick)?.pathRef.current());
    editorChangesRef.current.push(...changes);
  });

  const ref = useMergedRefs(commandsRef, batchChangesRef, brickRef, refProp);

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
