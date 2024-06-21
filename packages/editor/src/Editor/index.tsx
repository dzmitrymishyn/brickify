import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import React, {
  forwardRef,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import useMergedRefs from './useMergedRef';
import {
  type Change,
  type Component,
  MutationsContext,
  useBricksBuilder,
  useMutation,
  withMutations,
} from '../bricks';
import { useLogger, withBrickContext } from '../core';


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
  const { clear, trackChange, afterMutationRange } = useContext(MutationsContext)!;
  const logger = useLogger();
  const changesRef = useRef<Change[]>([]);
  const changeBlock = useCallback(
    (change: Change) => {
      changesRef.current.push(trackChange(change));
    },
    [trackChange],
  );
  const [components, treeRef] = useBricksBuilder(value, bricks, changeBlock);

  // When the components are updated we need to clear our MutationsArray to prevent DOM restoring
  useEffect(clear, [components, clear]);
  useEffect(() => {
    pipe(afterMutationRange(), fromCustomRange, addRange);
  }, [afterMutationRange, components]);

  const mutationRef: RefObject<HTMLElement> = useMutation({
    before: () => {
      changesRef.current = [];
    },
    after: () => {
      if (!changesRef.current.length) {
        return;
      }

      const changes = changesRef.current;
      const newValue = patch(treeRef.current!, changes) as {
        children: unknown;
      };

      logger.log('Editor value is updated', newValue.children);

      onChange?.(newValue.children);
    },
  });

  const ref = useMergedRefs(mutationRef, refProp);

  return (
    <div
      ref={ref}
      data-brick="editor"
      contentEditable
      suppressContentEditableWarning
    >
      {components}
    </div>
  );
});

Editor.displayName = 'Editor';

export default pipe(
  Editor,
  withMutations,
  withBrickContext,
);
