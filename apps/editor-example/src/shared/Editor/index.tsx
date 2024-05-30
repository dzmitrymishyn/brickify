'use client';

import React, {
  forwardRef,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import {
  type Change,
  type Component,
  MutationsContext,
  useBricksBuilder,
  useMutation,
  withMutations,
} from '@/shared/bricks';
import { patch } from '@/shared/utils/three';

import useMergedRefs from './useMergedRef';

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
  // eslint-disable-next-line -- TODO: check it
  const { clear, trackChange } = useContext(MutationsContext)!;
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

  // eslint-disable-next-line -- TODO: check it
  const mutationRef: RefObject<HTMLElement> = useMutation({
    before() {
      changesRef.current = [];
    },
    // mutate: console.log.bind(null, 'Editor:mutate'),
    after: () => {
      if (!changesRef.current.length) {
        return;
      }

      // eslint-disable-next-line -- TODO: check it
      const newValue = patch(treeRef.current, changesRef.current as any) as {
        children: unknown;
      };

      // eslint-disable-next-line -- TODO: check it
      console.log('value is updated', newValue.children);

      onChange?.(newValue.children);
    },
    // eslint-disable-next-line -- TODO: check it
  } as any);

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

export default withMutations(Editor);
