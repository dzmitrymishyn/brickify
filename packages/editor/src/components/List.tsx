import {
  applySlots,
  type BrickValue,
  extend,
  hasProps,
  type PropsWithStoredValue,
  useRenderer,
  useRendererRegistry,
  withName,
} from '@brickifyio/renderer';
import { compile } from 'css-select';
import { Node as DomhandlerNode } from 'domhandler';

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
      ref.current?.childNodes.forEach((node, index) => {
        if (addedDescendants.includes(node)) {
          const innerHTML = node instanceof HTMLElement ? node.innerHTML : '';
          add([
            ...stored.pathRef.current(),
            'children',
            `${index - addedItemsCount}`
          ], innerHTML);
          addedItemsCount += 1;
        }
      });
    }
  });

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

      const Component = options.components.ListItem;
      const pathPrefix = ['children', index];
      const childStored = {
        name: 'ListItem',
        components: options.components,
        pathRef: {
          current: () => pathPrefix,
        },
        value: { value },
      };

      return (
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
  {
    is: (node: DomhandlerNode | Node) => {
      if (node instanceof DomhandlerNode) {
        return compile('ul')(node);
      }

      if (node instanceof HTMLElement) {
        return node.matches('ul');
      }

      return false;
    },
  },
);
