import { patch } from '@brickifyio/utils/object';
import { useCallback, useRef } from 'react';

import { type Change } from '../changes';

type UseOnChange = {
  onChange?: (value: unknown) => void;
  rootTreeNode: object;
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

    const newValue = patch(rootTreeNode, changes);

    // eslint-disable-next-line no-console -- TODO: Replace it with logger
    console.log('New value', newValue);

    onChangeRef.current?.(newValue);
  }, [rootTreeNode]);

  return change;
};
