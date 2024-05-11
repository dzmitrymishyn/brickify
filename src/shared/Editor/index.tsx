'use client';

import React, {
  forwardRef,
  RefObject,
  useContext,
  useEffect,
} from 'react';

import { Brick, useBricksBuilder } from '@/shared/bricks';

import useMergedRefs from './useMergedRef';
import { useMutation } from './useMutation';
import { MutationsContext, withMutations } from './withMutations';

type Props = {
  value: unknown;
  bricks?: Brick<any>[];
  // TODO: This should return updated blocks + the updated result
  onChange?(updatedBlocks: unknown[]): void;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  onChange,
}, refProp) => {
  const { setHandleResults, clear } = useContext(MutationsContext)!;
  const components = useBricksBuilder(value, bricks);

  // When the components are updated we need to clear our MutationsArray to prevent DOM
  // restoring
  useEffect(clear, [components, clear]);
  // TODO: I don't like the direction of data updates
  // It should be from the bottom to the top. And we need to use onChange function to
  // handle them.
  useEffect(() => onChange && setHandleResults(onChange), [onChange, setHandleResults]);

  const mutationRef: RefObject<HTMLElement> = useMutation({
    // TODO: it's probably not required. This about the situations we're going to handle
    // characterData into Editor
    // characterData: () => mutationRef.current?.innerHTML ?? '',
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

export default withMutations(Editor);
