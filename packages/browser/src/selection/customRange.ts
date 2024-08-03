import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getCursorPosition, getNodeByOffset } from './offset';
import { fromRangeLike } from './rangeLike';

export type CustomRange = {
  startPath: { offset: number, childOffset: number, childOffsetType: 'start' | 'end' | 'center' };
  endPath: { offset: number, childOffset: number, childOffsetType: 'start' | 'end' | 'center' };
  // endPath: number[];
  container: Node;
};

const getPath = (container: Node, node: Node, offset: number) => {
  return getCursorPosition(container, node, offset);
  // const startPath: number[] = [offset];
  // let current: Node | null = node;

  // while (current && current !== container) {
  //   startPath.unshift(
  //     Array.from(current.parentNode?.childNodes ?? [])
  //       .indexOf(current as ChildNode),
  //   );
  //   current = current.parentNode;
  // }

  // if (current === null) {
  //   return O.none;
  // }

  // return O.some(startPath);
};

export const toCustomRange = (container: Node) => flow(
  O.fromNullable<Range | null | undefined>,
  O.bindTo('range'),
  O.map(({ range }) => ({
    start: getPath(container, range.startContainer, range.startOffset),
    end: getPath(container, range.endContainer, range.endOffset),
  })),
  O.map(({ start, end }): CustomRange => ({
    startPath: start,
    endPath: end,
    container,
  })),
  O.toUndefined,
);

// const makePath = (container: Node, path: number[]) => {
//   let current = container;

//   for (let i = 0; i < path.length - 1; i += 1) {
//     current = current?.childNodes?.[path[i]];
//   }

//   if (!current) {
//     return O.none;
//   }

//   return O.some({ node: current, offset: path[path.length - 1] });
// };

export const fromCustomRange = flow(
  O.fromNullable<CustomRange | null | undefined>,
  // O.bindTo('customRange'),
  O.map(({ startPath, endPath, container }) => ({
    start: getNodeByOffset({ ...startPath, node: container }),
    end: getNodeByOffset({ ...endPath, node: container }),
  })),
  // O.bind('start', ({ customRange }) =>
  //   makePath(customRange.container, customRange.startPath)),
  // O.bind('end', ({ customRange }) =>
  //   makePath(customRange.container, customRange.endPath)),
  O.map(({ start, end }) => fromRangeLike({
    startContainer: start.node,
    startOffset: start.offset,
    endContainer: end.node,
    endOffset: end.offset,
  })),
  O.getOrElseW(() => null),
);
