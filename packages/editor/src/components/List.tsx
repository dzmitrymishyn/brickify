import {
  applySlots,
  type BrickValue,
  extend,
  getName,
  handleAddedNodes,
  hasNodeToBrick,
  hasProps,
  type PropsWithStoredValue,
  type RendererStoreValue,
  usePrimitiveChildrenCache,
  useRenderer,
  useRendererContext,
  useRendererRegistry,
  withMatcher,
  withName,
  withNodeToBrick,
} from '@brickifyio/renderer';
import { cloneElement } from 'react';

import { type PropsWithChange, useChanges } from '../changes';
import { Commander } from '../commands';
import { useMutation } from '../mutations';
import Paragraph from '../Paragraph';

type Value = BrickValue & {
  children: string[];
};

type Props = PropsWithStoredValue<Value> & PropsWithChange & {
  children: Value['children'];
};

const List: React.FC<Props> = ({ stored, children, onChange }) => {
  const ref = useRendererRegistry<HTMLUListElement>(stored);
  const { add } = useChanges();

  const components = applySlots([
    ['ListItem', 'Paragraph', Paragraph, { component: 'li', style: { margin: 0 } }],
  ], stored?.components);

  const { markToRevert } = useMutation(ref, ({ mutations, removed, addedDescendants }) => {
    markToRevert(mutations);

    if (removed) {
      return onChange?.(undefined);
    }

    const ListItem = components.ListItem;

    if (!hasNodeToBrick(ListItem)) {
      return;
    }

    handleAddedNodes({
      add: ({ node, index }) => add(
        [...stored.pathRef.current(), 'children', `${index}`],
        ListItem.nodeToBrick<{ value: string }>(
          node,
          { component: ListItem }
        ).value,
      ),
      addedNodes: addedDescendants,
      allNodes: Array.from(ref.current?.childNodes ?? []),
    });
  });

  const cache = usePrimitiveChildrenCache();
  const { store } = useRendererContext();
  const childrenElements = useRenderer({
    value: children,
    components,
    pathPrefix: () => [...stored.pathRef.current(), 'children'],
    render(value, options) {
      const index = options.pathRef.current().at(-1);

      if (typeof value !== 'string' || !index) {
        return null;
      }

      const cachedValue = cache.get(index, options.previousValue);
      const oldStored = cachedValue
        && store.get<{ value: unknown }>(cachedValue.value);

      if (oldStored?.react) {
        if (oldStored.value.value === value) {
          return oldStored.react;
        }

        const props = { value };
        oldStored.value = cache.save(index, value);
        oldStored.react = cloneElement(oldStored.react, props);

        return oldStored.react;
      }

      const childStored: RendererStoreValue<{ value: unknown } | undefined> = {
        name: 'ListItem',
        components: options.components,
        pathRef: {
          current: () => pathPrefix,
        },
        value: cache.save(index, value),
      };

      const Component = options.components.ListItem;
      const pathPrefix = ['children', index];

      childStored.react = (
        <Component
          {...hasProps(Component) ? Component.props : {}}
          value={value}
          stored={childStored}
          key={index}
          component="li"
          style={{ margin: 0 }}
          onChange={(event: { value: string }) => {
            onChange?.(event?.value, pathPrefix);
          }}
        />
      );

      return childStored.react;
    },
  });

  return (
    <ul ref={ref}>
      <Commander containerRef={ref} components={components} />
      {childrenElements}
    </ul>
  );
};

export default extend(
  List,
  withName('List'),
  withMatcher((node) => node instanceof HTMLElement && node.matches('ul')),
  withNodeToBrick((node, { components, component }) => {
    const ListItem = applySlots([
      ['ListItem', 'Paragraph', Paragraph, { component: 'li', style: { margin: 0 } }],
    ], components)?.ListItem;

    if (!(node instanceof HTMLUListElement) || !hasNodeToBrick(ListItem)) {
      return null;
    }

    return {
      id: Math.random().toFixed(5),
      brick: getName(component),
      children: Array.from(node.childNodes).map(
        (childNode) => ListItem.nodeToBrick<{ value: string }>(childNode, { component: ListItem })?.value,
      ),
    };
  }),
);
