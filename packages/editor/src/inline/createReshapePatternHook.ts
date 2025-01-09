import { surround } from '@brickifyio/browser/manipulations';
import {
  fromCustomRange,
  fromRangeCopy,
  getNodeByOffset,
} from '@brickifyio/browser/selection';
import { isElement } from '@brickifyio/browser/utils';
import { tap } from '@brickifyio/operators';
import { sequenceS } from 'fp-ts/lib/Apply';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import { type RefObject } from 'react';

import { useMutation } from '../mutations';
import { type ParagraphResults } from '../Paragraph';

const deleteText = (container: Node, from: number, to: number) => {
  const range = fromCustomRange({
    container,
    startPath: {
      offset: from,
    },
    endPath: {
      offset: to,
    },
  });

  range?.extractContents();
};

export const createReshapePatternHook = (
  component: { selector: string; create: () => Element },
  pattern: RegExp,
) => {
  return (ref: RefObject<HTMLElement | null>) => {
    useMutation<ParagraphResults>(
      ref,
      flow(
        ({ range, results }) => ({
          range: O.fromNullable(range),
          text: O.fromNullable(results('paragraph').text),
          startNode: O.fromNullable(results('paragraph').leftCornerNode),
          container: O.fromNullable(ref.current),
        }),
        sequenceS(O.Applicative),
        O.bind('match', ({ text }) => O.fromNullable(pattern.exec(text))),
        O.bind('startIndex', ({ match }) => O.some(
          match.index + match[0].search(/\S/),
        )),
        O.bind('captured', ({ match }) => O.fromNullable(
          match.groups?.captured ?? match.at(-1) ?? null,
        )),
        O.bind('fullCaptured', ({ match }) => O.fromNullable(
          match.groups?.fullCaptured ?? match.at(-2) ?? null,
        )),
        O.bind('capturedStartIndex', ({ match, captured }) => O.some(
          match[0].indexOf(captured),
        )),
        O.map(({
          container,
          startNode,
          startIndex,
          range,
          match,
          capturedStartIndex,
          captured,
          fullCaptured,
        }) => pipe(
          getNodeByOffset(startNode, startIndex, undefined, container),
          ({ node, offset }) => O.fromNullable(fromRangeCopy({
            startContainer: node,
            startOffset: offset,
            endContainer: range.startContainer,
            endOffset: range.startOffset,
          })),
          O.map(
            (capturedRange) => surround(component, capturedRange, container),
          ),
          O.chain(O.fromNullable),
          O.map(tap(() => deleteText(
            container,
            match.index + capturedStartIndex + captured.length,
            startIndex + fullCaptured.length,
          ))),
          O.map(tap(() => deleteText(
            container,
            startIndex,
            match.index + capturedStartIndex,
          ))),
          O.map(tap((surroundRange) => {
            range.setStartAfter(
              isElement(surroundRange.endContainer)
                ? surroundRange.endContainer
                  .childNodes[surroundRange.endOffset]
                : surroundRange.endContainer
            );
            range.collapse(true);
          })),
        )),
      ),
    );
  };
};
