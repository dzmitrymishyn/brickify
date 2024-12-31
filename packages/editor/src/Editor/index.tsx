import {
  type BrickValue,
  type Component,
  getName,
  type PropsWithStoredValue,
  useRenderer,
  useRendererContext,
  useRendererRegistry,
  withRendererContext,
} from '@brickifyio/renderer';
import { useMergedRefs } from '@brickifyio/utils/hooks';
import { forwardRef, useMemo } from 'react';

import { type PropsWithChange, useChanges, useChangesPluginFactory } from '../changes';
import { Commander, useCommandsPluginFactory } from '../commands';
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
  const { store } = useRendererContext();
  const rootRef = useRendererRegistry(stored);

  const ref = useMergedRefs(
    refProp,
    rootRef,
  );

  const { add } = useChanges();
  const { markToRevert } = useMutation(rootRef, ({ mutations }) => {
    markToRevert(mutations);

    let addedItemsCount = 0;
    Array.from(rootRef.current?.childNodes ?? []).forEach((node, index) => {
      if (store.get(node)) {
        return;
      }

      const Component = Object.values(components).find((component) => (
        'is' in component
        && typeof component.is === 'function'
        && component.is(node)
      ));

      if (Component) {
        const innerHTML = node instanceof HTMLElement ? node.innerHTML : '';
        const innerText = node instanceof HTMLElement ? node.innerText.trim() : '';;
        const brick = getName(Component);
        add([...stored.pathRef.current(), 'value', `${index - addedItemsCount}`], {
          brick,
          id: Math.random().toFixed(5),
          ...(brick === 'Paragraph' || brick === 'Heading') && {
            value: innerText ? innerHTML : `<br>`,
          },
          ...brick === 'List' && {
            children: Array.from(node.childNodes ?? []).map((child: any) => child.innerHTML) ?? [],
          },
        });
        addedItemsCount += 1;
      }
    });
  });

  const value = useRenderer(useMemo(() => ({
    value: stored.value,
    components,
    pathPrefix: () => ['value'],
  }), [components, stored.value]));

  return (
    <>
      <Commander containerRef={rootRef} components={components} />
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
    useMutationsPluginFactory,
    useCommandsPluginFactory,
  ],
});

export { Editor as EditorWithoutContext };
