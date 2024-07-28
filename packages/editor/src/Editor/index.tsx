import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  useCallback,
  useRef,
} from 'react';

import {
  type Change,
  type Component,
  extend,
  useBatchChanges,
  useBrickContext,
  useBricksBuilder,
  withBrickContext,
  withBrickName,
} from '../core';
import { useCommands } from '../core/commands';
import { useMergedRefs } from '../utils';

type Props = {
  value: unknown[];
  bricks?: Component[];
  onChange?: (value: unknown) => void;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  onChange,
}, refProp) => {
  const { editable, changes: changesController } = useBrickContext();
  const editorChangesRef = useRef<Change[]>([]);
  const onChangeRef = useRef<(value: unknown) => void>();

  onChangeRef.current = onChange;

  const emitChange = useCallback((
    changes: Change[],
    root?: Node,
  ) => {
    if (!changes.length || !root) {
      return;
    }

    const newValue = patch(root, changes) as {
      children: unknown;
    };

    onChangeRef.current?.({ type: 'update', value: newValue.children });
  }, []);

  const [components, treeRef] = useBricksBuilder(
    value,
    bricks,
    (...changes) => {
      if (!changes.length) {
        return;
      }

      if (changesController.state() === 'interaction') {
        emitChange(changes, treeRef.current ?? undefined);
        return;
      }

      editorChangesRef.current.push(...changes);
      return changes;
    },
  );

  const batchChangesRef = useBatchChanges({
    apply: () => {
      emitChange(editorChangesRef.current, treeRef.current ?? undefined);
      editorChangesRef.current = [];
    },
  });

  const commandsRef = useCommands(bricks, (...changes) => {
    editorChangesRef.current.push(...changes);
  });

  const ref = useMergedRefs(commandsRef, batchChangesRef, refProp);

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
