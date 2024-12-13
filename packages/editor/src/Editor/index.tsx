import {
  type BrickValue,
  type Component,
  type PropsWithStoredValue,
  useRenderer,
  useRendererRegistry,
  withRendererContext,
} from '@brickifyio/renderer';
import { useMergedRefs } from '@brickifyio/utils/hooks';
import { forwardRef } from 'react';

import { type PropsWithChange, useChangesPluginFactory } from '../changes';
import { Commander, useCommandsPluginFactory } from '../commands';
import { useMutation, useMutationsPluginFactory } from '../mutations';
import { useSelectionPluginFactory } from '../selection';

type Props = PropsWithStoredValue<BrickValue[]> & PropsWithChange & {
  // value: BrickValue[];
  components?: Component[];
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  components = [],
  stored,
  style,
}, refProp) => {
  // const { editable } = useRendererContext();
  const editable = true;
  const rootRef = useRendererRegistry(stored);

  const ref = useMergedRefs(
    refProp,
    rootRef,
    // useBrickRegistry(storedValue),
    // useCommands(bricks),
  );

  const { markToRevert } = useMutation(rootRef, ({ mutations }) => {
    markToRevert(mutations);
  });

  const { value } = useRenderer({
    slotsValue: { value: stored.value },
    slotsMeta: { value: components },
    // props: { onChange },
  });

  return (
    <>
      <Commander containerRef={rootRef} components={components} />
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
    </>
  );
});

Editor.displayName = 'Editor';

export default withRendererContext(Editor, {
  plugins: [
    useChangesPluginFactory,
    useSelectionPluginFactory,
    useMutationsPluginFactory,
    useCommandsPluginFactory,
  ],
});

export { Editor as EditorWithoutContext };
