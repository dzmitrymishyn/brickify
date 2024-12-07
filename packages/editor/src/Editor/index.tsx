import {
  type BrickValue,
  type Component,
  // extend,
  // type PropsWithBrick,
  type PropsWithChange,
  // useBrickContext,
  // useBrickRegistry,
  // useCommands,
  // useMergedRefs,
  // useRenderer,
  // withBrickContext,
  // withBrickName,
} from '@brickifyio/core';
import {
  extend,
  type PropsWithStoredValue,
  useRenderer,
  useRendererRegistry,
  withProps,
  withRendererContext,
} from '@brickifyio/renderer';
import { useMergedRefs } from '@brickifyio/utils/hooks';
import {
  forwardRef,
} from 'react';

import { useChangesPluginFactory } from '../changes';

type Props = PropsWithStoredValue<BrickValue[]> & PropsWithChange & {
  // value: BrickValue[];
  components?: Component[];
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  components = [],
  stored,
  // onChange,
  style,
}, refProp) => {
  // const { editable } = useRendererContext();
  const editable = true;

  const ref = useMergedRefs(
    refProp,
    // useBrickRegistry(storedValue),
    useRendererRegistry(stored),
    // useCommands(bricks),
  );

  const { value } = useRenderer({
    slotsValue: { value: stored.value },
    slotsMeta: { value: components },
    // props: { onChange },
  });

  return (
    <div
      ref={ref}
      data-brick="editor"
      style={style}
      {...editable && {
        contentEditable: true,
        suppressContentEditableWarning: true,
      }}
    >
      {value}
    </div>
  );
});

Editor.displayName = 'Editor';

export default withRendererContext(Editor, {
  plugins: [useChangesPluginFactory],
});

export { Editor as EditorWithoutContext };
