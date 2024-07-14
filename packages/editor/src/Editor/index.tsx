import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  useCallback,
  useRef,
} from 'react';

import {
  type Component,
  type NamedComponent,
  useBricksBuilder,
} from '../bricks';
import {
  type ChangeEvent,
  useBatchChanges,
  useBrickContext,
  useLogger,
  withBrickContext,
} from '../core';
import { useCommands } from '../core/commands';
import { useMergedRefs } from '../utils';

type Props = {
  value: unknown[];
  // eslint-disable-next-line -- TODO: check it
  bricks?: Component<any>[];
  onChange?: (value: unknown) => void;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  onChange,
}, refProp) => {
  const { editable, changes: changesController } = useBrickContext();
  const logger = useLogger();
  const editorChangesRef = useRef<ChangeEvent[]>([]);
  const onChangeRef = useRef<(value: unknown) => void>();

  onChangeRef.current = onChange;

  const emitChange = useCallback((
    changes: ChangeEvent[],
    root?: Node,
  ) => {
    if (!changes.length || !root) {
      return;
    }

    const newValue = patch(root, changes) as {
      children: unknown;
    };

    logger.log('Editor value is updated', newValue.children);

    onChangeRef.current?.({ type: 'update', value: newValue.children });
  }, [logger]);

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

const EditorWithContext = pipe(
  Editor,
  withBrickContext,
  (editor) => {
    (editor as NamedComponent).brick = 'Editor';
    return editor;
  },
);

export { Editor as EditorWithoutContext };
export default EditorWithContext;
