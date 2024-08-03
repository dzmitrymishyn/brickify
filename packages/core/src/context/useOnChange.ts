import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { useCallback, useEffect, useRef } from 'react';

import { type Change, type ChangesController } from '../changes';

type UseOnChange = {
  onChange?: (value: unknown) => void;
  rootTreeNode: Node;
  changesController: ChangesController;
};

export const useOnChange = ({
  onChange,
  rootTreeNode,
  changesController,
}: UseOnChange) => {
  const editorChangesRef = useRef<Change[]>([]);
  const onChangeRef = useRef<(value: unknown) => void>();
  onChangeRef.current = onChange;
  const emitChange = useCallback((changes: Change[]) => {
    if (!changes.length) {
      return;
    }

    const newValue = patch(rootTreeNode, changes, []) as {
      value: unknown;
    };

    console.log('New value', newValue.value);

    onChangeRef.current?.(newValue.value);
  }, [rootTreeNode]);

  const change = useCallback((...changes: Change[]) => {
    if (!changes.length) {
      return;
    }

    if (changesController.state() === 'interaction') {
      emitChange(changes);
      return;
    }

    editorChangesRef.current.push(...changes);
    return changes;
  }, [changesController, emitChange]);

  useEffect(() => {
    return changesController.subscribeBatch(null, {
      apply: () => {
        debugger;
        emitChange(editorChangesRef.current);
        editorChangesRef.current = [];
      },
    });
  }, [emitChange, changesController]);

  return change;
};
