// TODO: Think about more flex structure for the component
// Right now it's hard to define Table -> TableRow -> TableCell
// It should be an array of strings. The current system works only with objects

import {
  extend,
  next,
  previous,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickRegistry,
  useCommands,
  useMergedRefs,
  useMutation,
  withName,
  withShortcuts,
  useBrickContext,
  // withSlots,
} from '@brickifyio/core';
import { type FC, type PropsWithChildren } from 'react';
import Paragraph from '../Paragraph';

type TableCellProps = PropsWithBrick<object> & PropsWithChange & {
  children: string;
}
type TableRowProps = PropsWithBrick<object> & PropsWithChange & {
  children: string[];
};

const TableCell = extend(
  ({ brick, children, onChange }: TableCellProps) => {
    const { store } = useBrickContext();
    // const { ref: brickRef } = useBrickRegistry(brick);

    // const ref = useMergedRefs(
    //   brickRef,
    //   useMutation(({ target, remove }) => {
    //     if (remove) {
    //       onChange?.({ type: 'remove' });
    //       return;
    //     }

    //     onChange?.({
    //       type: 'update',
    //       children: target.textContent ?? '',
    //     });
    //   }),
    // );

    return (
      <Paragraph
        component="td"
        value={children}
        brick={brick}
        onChange={(...changes) => {
          const path = store.get(brick)?.pathRef.current() ?? [];
          onChange?.(...changes.map(({ type, value }) => ({
            type,
            value,
            path,
          })));
        }}
      />
      // <td
      //   style={{
      //     border: '1px solid #ccc',
      //     padding: '10px',
      //   }}
      //   ref={ref}
      //   data-brick="tableCell"
      // >
      //   {children || <br />}
      // </td>
    );
  },
  withName('TableCell'),
  withShortcuts([
    {
      name: 'nextCellOrNewRow',
      shortcuts: ['tab'],
      handle: ({
        originalEvent,
        target,
        descendants,
        resultRange,
        getFromStore,
        onChange,
      }) => {
        originalEvent.preventDefault();

        const currentCell = descendants.at(-1)!;

        if (currentCell?.nextSibling) {
          const currentCellStoredValue = getFromStore(currentCell)!;
          const nextCellPath = next(currentCellStoredValue.pathRef.current());

          resultRange({
            start: {
              offset: 0,
              path: nextCellPath,
            },
            end: {
              offset: 0,
              path: nextCellPath,
            },
          });
        } else if (target.nextSibling) {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = next(currentRowStoredValue.pathRef.current());
          resultRange({
            start: {
              offset: 0,
              path: nextRowPath,
            },
            end: {
              offset: 0,
              path: nextRowPath,
            },
          });
        } else {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = next(currentRowStoredValue.pathRef.current());
          onChange({
            type: 'add',
            path: nextRowPath,
            value: {
              brick: 'TableRow',
              id: Math.random().toFixed(3),
              children: Array.from(target.childNodes, () => ({
                brick: 'TableCell',
                id: Math.random().toFixed(3),
                children: '',
              })),
            },
          });
          resultRange({
            start: {
              offset: 0,
              path: [...nextRowPath, 'children', '0'],
            },
            end: {
              offset: 0,
              path: [...nextRowPath, 'children', '0'],
            },
          });
        }

        // Empty change
        onChange({
          type: 'update',
          path: getFromStore(currentCell)!.pathRef.current(),
        });
      },
    },
    {
      name: 'nextCellOrNewRow',
      shortcuts: ['shift+tab'],
      handle: ({
        originalEvent,
        target,
        descendants,
        resultRange,
        getFromStore,
        onChange,
      }) => {
        originalEvent.preventDefault();

        const currentCell = descendants.at(-1)!;

        if (currentCell?.previousSibling) {
          const currentCellStoredValue = getFromStore(currentCell)!;
          const nextCellPath = previous(
            currentCellStoredValue.pathRef.current(),
          );

          resultRange({
            start: {
              offset: 0,
              path: nextCellPath,
            },
            end: {
              offset: 0,
              path: nextCellPath,
            },
          });
        } else if (target.previousSibling) {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = previous(
            currentRowStoredValue.pathRef.current(),
          );
          resultRange({
            start: {
              offset: 0,
              path: nextRowPath,
            },
            end: {
              offset: 0,
              path: nextRowPath,
            },
          });
        }

        onChange({
          type: 'update',
          path: getFromStore(currentCell)!.pathRef.current(),
        });
      },
    },
  ])
);

const TableRow = extend(
  ({ brick, children, onChange }: TableRowProps) => {
    const { ref: brickRef, useBrickChildrenRegistry } = useBrickRegistry(brick);
    const childrenBricks = useBrickChildrenRegistry(null, children);

    const ref = useMergedRefs(
      brickRef,
      useCommands([TableCell]),
      useMutation(({ remove }) => {
        if (remove) {
          onChange?.({ type: 'remove' });
        }
      })
    );

    return (
      <tr ref={ref} data-brick="tableRow">
        {childrenBricks.map((childBrick, index) => (
          <TableCell
            brick={childBrick}
            key={index}
            children={childBrick.value}
            onChange={onChange}
          />
        ))}
      </tr>
    );
  },
  withName('TableRow'),
  // withSlots({
  //   children: [TableCell],
  // }),
  withShortcuts([
    {
      name: 'preventNewLine',
      shortcuts: ['enter'],
      handle: ({ stopBrickPropagation }) => {
        stopBrickPropagation();
      },
    },
  ]),
);

type Props = PropsWithBrick & PropsWithChange & {
  children: string[][];
};

const Table: FC<Props> = ({ children, brick, onChange: onChangeProp }) => {
  const { ref: brickRef, useBrickChildrenRegistry } = useBrickRegistry(brick);
  const childrenBricks = useBrickChildrenRegistry('children', children);

  const ref = useMergedRefs(
    brickRef,
    useCommands([TableRow]),
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChangeProp?.({ type: 'remove' });
      }
    }),
  );

  return (
    <table ref={ref} data-brick="table">
      <tbody>
        {childrenBricks.map((childBrick, index) => (
          <TableRow
            key={index}
            brick={childBrick}
            children={childBrick.value}
            onChange={onChangeProp}
          />
        ))}
      </tbody>
    </table>
  );
};

export default extend(
  Table,
  withName('Table'),
  // withSlots({
  //   children: [TableRow],
  // }),
);
