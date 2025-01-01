import {
  applySlots,
  type BrickValue,
  extend,
  hasProps,
  type PropsWithStoredValue,
  type RendererStoreValue,
  usePrimitiveChildrenCache,
  useRenderer,
  useRendererContext,
  useRendererRegistry,
  withMatcher,
  withName,
} from '@brickifyio/renderer';
import { cloneElement } from 'react';

import { type PropsWithChange, useChanges } from '../changes';
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

  const { markToRevert } = useMutation(ref, ({ mutations, removed, addedDescendants }) => {
    markToRevert(mutations);

    if (removed) {
      return onChange?.(undefined);
    }

    if (addedDescendants.length) {
      let addedItemsCount = 0;
      const path = [
        ...stored.pathRef.current(),
        'children',
      ];
      ref.current?.childNodes.forEach((node, index) => {
        if (addedItemsCount === addedDescendants.length) {
          return;
        }

        if (addedDescendants.includes(node)) {
          const innerHTML = node instanceof HTMLElement ? node.innerHTML : '';
          add([
            ...path,
            `${index - addedItemsCount}`
          ], innerHTML);
          addedItemsCount += 1;
        }
      });
    }
  });

  const cache = usePrimitiveChildrenCache();
  const { store } = useRendererContext();
  const childrenElements = useRenderer({
    value: children,
    components: applySlots([
      ['ListItem', 'Paragraph', Paragraph, { component: 'li', style: { margin: 0 } }],
    ], stored?.components),
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
      {childrenElements}
    </ul>
  );
};

export default extend(
  List,
  withName('List'),
  withMatcher((node) => node instanceof HTMLElement && node.matches('ul')),
);
