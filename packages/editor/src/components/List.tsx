import { getLastDeepLeaf } from '@brickifyio/browser/utils';
import {
  extend,
  next,
  type PropsWithBrick,
  type PropsWithChange,
  useBatchChanges,
  useBrickRegistry,
  useCommands,
  useMergedRefs,
  useMutation,
  withName,
  withProps,
  withShortcuts,
  withSlots,
} from '@brickifyio/core';
import { Children, type FC, type PropsWithChildren, useRef } from 'react';

import { ShiftEnterBr } from './Br';
import Em from './Em';
import Strong from './Strong';
import Paragraph from '../Paragraph';
import assert from 'assert';

const ListItem = extend(
  Paragraph,
  withProps({
    component: 'li',
    bricks: [ShiftEnterBr, Strong, Em],
  }),
  withName('ListItem'),
  withShortcuts([
    {
      name: 'newLine',
      shortcuts: ['enter'],
      handle: ({ onChange, range, resultRange, getFromStore, results, descendants }) => {
        const currentRange = range();
        const target = descendants[0] as HTMLElement;
        const cacheItem = getFromStore(target);

        assert(target, 'This handler should be called by it\'s parent and descendants should be defined');

        if (target.innerHTML === '<br>' && !target.nextElementSibling) {
          return onChange?.({
            type: 'remove',
            path: cacheItem?.pathRef.current(),
          });
        }

        if (currentRange) {
          assert(cacheItem, 'Cache item should exist');

          currentRange.extractContents();
          results({ stop: true });

          const tempDiv = document.createElement('div');
          const tempRange = new Range();
          tempRange.setStart(currentRange.startContainer, currentRange.startOffset);
          tempRange.setEnd(
            getLastDeepLeaf(target)!,
            getLastDeepLeaf(target)?.textContent?.length
              ?? getLastDeepLeaf(target)?.childNodes?.length
              ?? 0,
          );

          if (!tempRange.collapsed) {
            tempDiv.append(tempRange.extractContents());
          }

          const newPath = next(cacheItem.pathRef.current());

          resultRange({
            start: { path: newPath, offset: 0 },
            end: { path: newPath, offset: 0 },
          });

          onChange?.({
            type: 'add',
            path: newPath,
            value: {
              brick: 'ListItem',
              id: Math.random().toFixed(3),
              // BR is a native browser behaviour to make an empty new line
              value: tempDiv.innerHTML ?? '',
            },
          });
        }
      },
    },
  ]),
);

const bricks = [
  ListItem,
];

type Props = PropsWithChildren & PropsWithBrick & PropsWithChange;

const List: FC<Props> = ({ children, brick, onChange: onChangeProp }) => {
  const { ref: brickRef } = useBrickRegistry(brick);

  const changesRef = useRef<number>(0);
  const ref = useMergedRefs(
    brickRef,
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChangeProp?.({ type: 'remove' });
      }
    }),
    useCommands(bricks, (...changes) => {
      changes.forEach(({ type }) => {
        if (type === 'add') {
          changesRef.current += 1;
        } else if (type === 'remove') {
          changesRef.current -= 1;
        }
      });
      onChangeProp?.(...changes);
    }),
    useBatchChanges({
      before: () => {
        changesRef.current = Children.count(children);
      },
      apply: () => {
        if (changesRef.current === 0) {
          onChangeProp?.({
            type: 'remove',
          });
        }
        changesRef.current = 0;
      },
    }),
  );

  return (
    <ul ref={ref} data-brick="list">
      {children}
    </ul>
  );
};

export default extend(
  List,
  withName('List'),
  withSlots({
    children: bricks,
  }),
);
