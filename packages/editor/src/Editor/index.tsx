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
  components?: Component[];
  style?: object;
};

const Editor = forwardRef<HTMLDivElement, Props>(({
  components = [],
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

    mutations.reduceRight((_, mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.parentNode !== rootRef.current) {
          return;
        }

        let current = node.previousSibling;
        let index = 0;
        while (current) {
          if (store.get(current)) {
            index += 1;
          }
          current = current.previousSibling;
        }

        const Component = components.find((component) => (
          'is' in component
          && typeof component.is === 'function'
          && component.is(node)
        ));

        if (Component) {
          const innerHTML = node instanceof HTMLElement ? node.innerHTML : '';
          const innerText = node instanceof HTMLElement ? node.innerText.trim() : '';;
          add([...stored.pathRef.current(), 'value', `${index}`], {
            brick: getName(Component),
            value: innerText ? innerHTML : `<br>`,
            id: Math.random().toFixed(5),
          });
        }
      });

      return _;
    }, null);
  });

  const { value } = useRenderer(useMemo(() => ({
    slotsValue: { value: stored.value },
    slotsMeta: { value: components },
  }), [components, stored.value]));

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
