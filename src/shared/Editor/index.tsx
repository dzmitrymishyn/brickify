'use client';

import React, { forwardRef } from 'react';

import { Brick, useBricksBuilder } from '@/shared/bricks';

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

  return (
    <div
      ref={refProp}
      data-brick="editor"
      contentEditable
      suppressContentEditableWarning
    >
      {components}
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
