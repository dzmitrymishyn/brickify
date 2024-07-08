import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  useCallback,
  useRef,
} from 'react';

import useMergedRefs from './useMergedRef';
import {
  type Component,
  useBricksBuilder,
} from '../bricks';
import {
  type Change,
  useBatchChanges,
  useBrickContext,
  useLogger,
  withBrickContext,
} from '../core';

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
  const editorChangesRef = useRef<Change[]>([]);
  const onChangeRef = useRef<(value: unknown) => void>();

  onChangeRef.current = onChange;

  const emitChange = useCallback((changes: Change[], root?: Node) => {
    if (!changes.length || !root) {
      return;
    }

    const newValue = patch(root, changes) as {
      children: unknown;
    };

    logger.log('Editor value is updated', newValue.children);

    onChangeRef.current?.(newValue.children);
  }, [logger]);

  const [components, treeRef] = useBricksBuilder(value, bricks, (...changes) => {
    if (!changes.length) {
      return;
    }

    if (changesController.state() === 'interaction') {
      emitChange(changes, treeRef.current ?? undefined);
      return;
    }

    editorChangesRef.current.push(...changes);
    return changes;
  });

  const batchChangesRef = useBatchChanges({
    apply: () => {
      emitChange(editorChangesRef.current, treeRef.current ?? undefined);
      editorChangesRef.current = [];
    },
  });

  const ref = useMergedRefs(batchChangesRef, refProp);

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
  Editor,
  withBrickContext,
);
