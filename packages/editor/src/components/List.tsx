import { getLastDeepLeaf } from '@brickifyio/browser/utils';
import {
  extend,
  next,
  type OnChange,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickChildrenRegistry,
  useBrickRegistry,
  useChangesApplier,
  useCommands,
  useMergedRefs,
  useMutation,
  withName,
  withShortcuts,
} from '@brickifyio/core';
import { Children, type FC, useCallback, useRef } from 'react';

import { ShiftEnterBr } from './Br';
import Em from './Em';
import Strong from './Strong';
import Paragraph from '../Paragraph';
import assert from 'assert';

const ListItem = extend(
  Paragraph,
  withName('ListItem'),
  withShortcuts([
    {
      name: 'newLine',
      shortcuts: ['enter'],
      handle: ({ onChange, range, resultRange, getFromStore, stopBrickPropagation, descendants }) => {
        const currentRange = range();
        const target = descendants[0] as HTMLElement;
        const cacheItem = getFromStore(target);

        assert(target, 'This handler should be called by it\'s parent and descendants should be defined');

        if (target.innerHTML === '<br>' && !target.nextElementSibling) {
          return onChange?.(null, {
            type: 'remove',
            path: cacheItem?.pathRef.current(),
          });
        }

        if (currentRange) {
          assert(cacheItem, 'Cache item should exist');

          currentRange.extractContents();

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

          onChange?.({ value: tempDiv.innerHTML ?? '' }, {
            type: 'add',
            path: newPath,
          });
          stopBrickPropagation();
        }
      },
    },
  ]),
);

const bricks = [
  ListItem,
];

type Props = PropsWithBrick & PropsWithChange & {
  children: string[];
};

const List: FC<Props> = ({ children, brick, onChange: onChangeProp }) => {
  const onChange: OnChange<{ value: string | number }> = useCallback((value, change) => {
    if (change.type === 'add') {
      changesRef.current += 1;
    } else if (change.type === 'remove') {
      changesRef.current -= 1;
    }
    onChangeProp?.(value?.value ?? '', change);
  }, [onChangeProp]);

  const {
    ref: brickRef,
  } = useBrickRegistry(brick, { onChange });

  const components = useBrickChildrenRegistry(
    brick,
    'children',
    children,
    (childBrick, index) => (
      <ListItem
        component="li"
        key={index}
        brick={childBrick}
        bricks={[ShiftEnterBr, Strong, Em]}
        onChange={onChange}
        value={childBrick.value}
      />
    ),
  );

  const changesRef = useRef<number>(0);
  changesRef.current = Children.count(children);

  const ref = useMergedRefs(
    brickRef,
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChangeProp?.(null, { type: 'remove', brick });
      }
    }),
    useCommands(bricks),
    useChangesApplier(() => {
      if (changesRef.current === 0) {
        onChangeProp?.(null, {
          type: 'remove',
          brick,
        });
      }
      changesRef.current = Children.count(children);
    }),
  );

  return (
    <ul ref={ref} data-brick="list">
      {components}
    </ul>
  );
};

export default extend(
  List,
  withName('List'),
);
