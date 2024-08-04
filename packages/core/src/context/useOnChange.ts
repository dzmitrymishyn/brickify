import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { useCallback, useRef } from 'react';

import { type Change } from '../changes';

type UseOnChange = {
  onChange?: (value: unknown) => void;
  rootTreeNode: Node;
};

export const useOnChange = ({
  onChange,
  rootTreeNode,
}: UseOnChange) => {
  const onChangeRef = useRef<(value: unknown) => void>();
  onChangeRef.current = onChange;

  const change = useCallback((...changes: Change[]) => {
    if (!changes.length) {
      return;
    }

    const newValue = patch(rootTreeNode, changes, []) as {
      value: unknown;
    };

    // eslint-disable-next-line no-console -- TODO: Replace it with logger
    console.log('New value', newValue.value);

    onChangeRef.current?.(newValue.value);
  }, [rootTreeNode]);

  return change;
};
