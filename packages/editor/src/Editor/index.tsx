import {
  type BrickValue,
  type Component,
  handleAddedNodes,
  hasNodeToBrick,
  type PropsWithStoredValue,
  useRendererRegistry,
  withRendererContext,
} from '@brickifyio/renderer';
import { useMergedRefs } from '@brickifyio/utils/hooks';
import { forwardRef, useMemo } from 'react';

import {
  type PropsWithChange,
  useChangesPlugin,
  useChangesPluginFactory,
} from '../changes';
import { useCommandsPluginFactory } from '../commands';
import { ContainerHooks } from '../ContainerHooks';
import { useEditorRenderer } from '../hooks/useEditorRenderer';
import { useMutation, useMutationsPluginFactory } from '../mutations';
import { useSelectionPluginFactory } from '../selection';

type Props = PropsWithStoredValue<BrickValue[]> & PropsWithChange & {
  components?: Record<string, Component>;
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  components = {},
  stored,
  style,
}, refProp) => {
  const editable = true;
  const rootRef = useRendererRegistry<HTMLElement>(stored);

  const ref = useMergedRefs(
    refProp,
    rootRef,
  );

  const { add } = useChangesPlugin();
  const { markToRevert } = useMutation(
    rootRef,
    ({ mutations, addedDescendants }) => {
      markToRevert(mutations);

      handleAddedNodes({
        add: ({ node, index, component }) => hasNodeToBrick(component) && add(
          [...stored.pathRef.current(), 'value', `${index}`],
          component.nodeToBrick(node, { components, component }),
        ),
        addedNodes: addedDescendants,
        allNodes: Array.from(rootRef.current?.childNodes ?? []),
        components,
      });
    },
  );

  const value = useEditorRenderer(useMemo(() => ({
    value: stored.value,
    components,
    pathPrefix: () => ['value'],
  }), [components, stored.value]));

  return (
    <>
      <ContainerHooks containerRef={rootRef} components={components} />
      <div
        ref={ref}
        data-brick="Editor"
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
    useSelectionPluginFactory,
    useCommandsPluginFactory,
    useMutationsPluginFactory,
    useChangesPluginFactory,
  ],
});

export { Editor as EditorWithoutContext };
