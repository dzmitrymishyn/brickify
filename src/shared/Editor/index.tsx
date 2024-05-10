'use client';

import React, { forwardRef } from 'react';

import { Brick, useBricksBuilder } from '@/shared/bricks';

import useMergedRefs from './useMergedRef';
import { useMutation } from './useMutation';
import { withMutations } from './withMutations';

type Props = {
  value: unknown;
  // eslint-disable-next-line react/require-default-props
  bricks?: Brick<any>[];
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
}, refProp) => {
  const components = useBricksBuilder(value, bricks);

  const mutationRef = useMutation({
    characterData: console.log,
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
