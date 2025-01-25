import {
  applySlots,
  type BrickValue,
  cloneOrCreateElement,
  extend,
  getName,
  handleAddedNodes,
  hasNodeToBrick,
  hasProps,
  type PropsWithStoredValue,
  usePrimitiveChildrenCache,
  useRenderer,
  useRendererContext,
  useRendererRegistry,
  withMatcher,
  withName,
  withNodeToBrick,
} from '@brickifyio/renderer';

import { type PropsWithChange, useChangesPlugin } from '../changes';
import { ContainerHooks } from '../ContainerHooks';
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
  const { add } = useChangesPlugin();

  const components = applySlots([
    ['ListItem', 'Paragraph', Paragraph, { component: 'li', style: { margin: 0 } }],
  ], stored?.components);

  const { markToRevert } = useMutation(
    ref,
    ({ mutations, removed, addedDescendants }) => {
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
    },
  );

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
        && store.get<{ value: unknown }>(cachedValue);
      const Component = options.components.ListItem;
      const pathPrefix = ['children', index];

      return cloneOrCreateElement(
        oldStored,
        () => options.previousValue === value,
        <Component
          {...hasProps(Component) ? Component.props : {}}
          value={value}
          stored={{
            name: 'ListItem',
            components: options.components,
            pathRef: {
              current: () => pathPrefix,
            },
            value: cache.save(index, value),
          }}
          key={index}
          component="li"
          style={{ margin: 0 }}
          onChange={(event: { value: string }) => {
            onChange?.(event?.value, pathPrefix);
          }}
        />,
      );
    },
  });

  return (
    <ul ref={ref}>
      <ContainerHooks containerRef={ref} components={components} />
      {childrenElements}
    </ul>
  );
};

const props = { component: 'li', style: { margin: 0 } };

export default extend(
  List,
  withName('List'),
  withMatcher((node) => node instanceof HTMLElement && node.matches('ul')),
  withNodeToBrick((node, { components, component }) => {
    const ListItem = applySlots([
      ['ListItem', 'Paragraph', Paragraph, props],
    ], components)?.ListItem;

    if (!(node instanceof HTMLUListElement) || !hasNodeToBrick(ListItem)) {
      return null;
    }

    return {
      id: Math.random().toFixed(5),
      brick: getName(component),
      children: Array.from(node.childNodes).map(
        (childNode) => ListItem.nodeToBrick<{ value: string }>(
          childNode,
          { component: ListItem },
        )?.value,
      ),
    };
  }),
);
