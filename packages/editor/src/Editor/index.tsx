import {
  type BrickValue,
  type Component,
  handleAddedNodes,
  hasNodeToBrick,
  type PropsWithStoredValue,
  useRenderer,
  useRendererRegistry,
  withRendererContext,
} from '@brickifyio/renderer';
import { useMergedRefs } from '@brickifyio/utils/hooks';
import { forwardRef, useMemo } from 'react';

import { type PropsWithChange, useChanges, useChangesPluginFactory } from '../changes';
import { useCommandsPluginFactory } from '../commands';
import { useMutation, useMutationsPluginFactory } from '../mutations';
import { useSelectionPluginFactory } from '../selection';
import { ContainerHooks } from '../ContainerHooks';

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

  const { add } = useChanges();
  const { markToRevert } = useMutation(rootRef, ({ mutations, addedDescendants }) => {
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
  });

  const value = useRenderer(useMemo(() => ({
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
    useChangesPluginFactory,
    useSelectionPluginFactory,
    useCommandsPluginFactory,
    useMutationsPluginFactory,
  ],
});

export { Editor as EditorWithoutContext };
