import { getFirstDeepLeaf, isElement } from '@brickifyio/browser/utils';
import { applySlots, type BrickValue, extend, hasProps, type PropsWithStoredValue, type RendererStoreValue, usePrimitiveChildrenCache, useRenderer, useRendererContext, useRendererRegistry, withName } from '@brickifyio/renderer';
import { cloneElement, useRef } from 'react';

import { type PropsWithChange, useChanges } from '../changes';
import { useCommand } from '../commands';
import { useMutation } from '../mutations';
import Paragraph from '../Paragraph';

type TableRowProps = PropsWithStoredValue<string[]> & {
  value: string[];
} & PropsWithChange<string>;

const TableRow: React.FC<TableRowProps> = ({ stored, value, onChange }) => {
  const ref = useRendererRegistry<HTMLTableRowElement>(stored);
  const components = applySlots([
    ['TableColumn', 'Paragraph', Paragraph, { component: 'td', style: { padding: 8, width: '33.3333%', border: '1px solid #ccc' } }],
  ], stored?.components);
  const { store } = useRendererContext();
  const cache = usePrimitiveChildrenCache();
  const nodes = useRenderer({
    value,
    components,
    pathPrefix: () => [...stored.pathRef.current()],
    render(columnValue, options) {
      const index = options.pathRef.current().at(-1);

      if (typeof columnValue !== 'string'  || !index) {
        return null;
      }

      const cachedValue = cache.get(index, options.previousValue);
      const oldStored = cachedValue
        && store.get<{ value: unknown }>(cachedValue);

      if (oldStored?.react) {
        if (oldStored.value.value === columnValue) {
          return oldStored.react;
        }

        const props = {
          value: columnValue,
          stored: { ...oldStored },
        };
        props.stored.value = cache.save(index, columnValue);
        props.stored.react = cloneElement(oldStored.react, props);

        return props.stored.react;
      }

      const Component = options.components.TableColumn;
      const pathPrefix = [index];
      const childStored: RendererStoreValue<{ value: unknown }> = {
        name: 'TableRow',
        components: options.components,
        pathRef: {
          current: () => pathPrefix,
        },
        value: cache.save(index, columnValue),
      };

      childStored.react = (
        <Component
          {...hasProps(Component) ? Component.props : {}}
          value={columnValue}
          stored={childStored}
          key={index}
          onChange={(event: { value: string }) => {
            onChange?.(event?.value, pathPrefix);
          }}
        />
      );

      return childStored.react;
    },
  });
  return (
    <tr ref={ref}>
      {nodes}
    </tr>
  );
};

type Props = PropsWithStoredValue<BrickValue & { children: string[][] }>
  & PropsWithChange;

const Table: React.FC<Props> = ({ stored, children, onChange }) => {
  const ref = useRendererRegistry<HTMLTableElement>(stored);
  const tbodyRef = useRef(null);

  const { store } = useRendererContext();
  const nodes = useRenderer({
    value: children,
    components: stored.components,
    pathPrefix: () => [...stored.pathRef.current(), 'children'],
    render(value, options) {
      const index = options.pathRef.current().at(-1);

      if (!Array.isArray(value) || !index) {
        return null;
      }

      const oldStored = store.get<string[]>(options.previousValue);
      if (options.previousValue === value && oldStored?.react) {
        oldStored.pathRef.current = () => [
          ...options.pathRef.current(),
          index,
        ];
        return oldStored.react;
      } else if (oldStored?.react) {
        const props = { value };
        oldStored.value = value as string[];
        oldStored.react = cloneElement(oldStored.react, props);
        return oldStored.react;
      }

      const pathPrefix = ['children', index];
      const childStored: RendererStoreValue<string[]> = {
        name: 'TableRow',
        components: options.components,
        pathRef: {
          current: () => pathPrefix,
        },
        value: value as string[],
      };

      childStored.react = (
        <TableRow
          key={index}
          stored={childStored}
          value={childStored.value}
          onChange={(event, columnIndex) => {
            onChange?.(event, [...pathPrefix, ...columnIndex ?? []]);
          }}
        />
      );

      return childStored.react;
    },
  });
  const { add } = useChanges();

  useCommand(ref, {
    shortcuts: ['tab'],
    name: 'nextColumn',
    handle: ({ originalEvent, descendants, range }) => {
      originalEvent.preventDefault();

      const target = descendants.at(-1);
      const nearestTd = isElement(target)
        ? target.closest('td')
        : target?.parentElement?.closest('td');

      if (nearestTd?.nextSibling) {
        const node = getFirstDeepLeaf(nearestTd.nextSibling)
          ?? nearestTd.nextSibling;
        range.setStart(node, 0);
        range.setEnd(node, 0);
        return;
      }

      if (nearestTd?.parentElement?.nextSibling) {
        originalEvent.preventDefault();
        const node = getFirstDeepLeaf(nearestTd.parentElement.nextSibling)
          ?? nearestTd.parentElement.nextSibling;
        range.setStart(node, 0);
        range.setEnd(node, 0);
        return;
      }

      const path = stored.pathRef.current();
      const value = stored.value.children;

      add([...path, 'children', `${value.length}`], Array.from(value[0]).fill(''));
    },
  });

  useCommand(ref, {
    shortcuts: ['shift + tab'],
    name: 'previousColumn',
    handle: ({ originalEvent, descendants, range }) => {
      const target = descendants.at(-1);
      const nearestTd = isElement(target)
        ? target.closest('td')
        : target?.parentElement?.closest('td');

      if (nearestTd?.previousSibling) {
        originalEvent.preventDefault();
        const node = getFirstDeepLeaf(nearestTd.previousSibling)
          ?? nearestTd.previousSibling;

        range.setStart(node, 0);
        range.setEnd(node, 0);

        return;
      }

      if (nearestTd?.parentElement?.previousSibling) {
        originalEvent.preventDefault();
        const previousTd = nearestTd?.parentElement?.previousSibling.lastChild;
        const node = getFirstDeepLeaf(previousTd) ?? previousTd!;
        range.setStart(node, 0);
        range.setEnd(node, 0);
      }
    },
  });

  const { markToRevert } = useMutation(ref, ({ removed, mutations }) => {
    markToRevert(mutations);

    if (removed) {
      onChange?.(undefined);
    }
  });

  return (
    <table ref={ref} style={{ width: '100%' }}>
      <tbody ref={tbodyRef}>
        {nodes}
      </tbody>
    </table>
  );
};

export default extend(
  Table,
  withName('Table'),
);
