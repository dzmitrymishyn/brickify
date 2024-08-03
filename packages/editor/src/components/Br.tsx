import { fromRangeLike } from '@brickifyio/browser/selection';
import { isText } from '@brickifyio/browser/utils';
import { extend, type HandleCommandOptions, withShortcuts } from '@brickifyio/core';
import { compile } from 'css-select';
import React from 'react';


const Br: React.FC = () => <br />;

const addBr = ({ range, results }: HandleCommandOptions) => {
  const newRange = fromRangeLike(range());

  if (newRange) {
    const brNode = document.createElement('br');

    // Make sure we'll not lose the range element after extracting the content
    newRange.collapse(true);
    range()?.extractContents();
    newRange.insertNode(brNode);

    // If we don't have text after the last br node we should add additional
    // br to display new line. After user starts typing on the line browser
    // automatically deletes the second br
    if (
      !brNode.nextSibling
      || (
        isText(brNode.nextSibling)
        && !brNode.nextSibling.textContent?.length
        && !brNode.nextSibling.nextSibling
      )
    ) {
      newRange.insertNode(document.createElement('br'));
    }

    newRange.setStartAfter(brNode);
    newRange.setEndAfter(brNode);

    range(newRange);
    results({ stopPropagation: true });
  }
};

export default extend(
  Br,
  { is: compile('br') },
  withShortcuts([
    {
      name: 'addBr',
      shortcuts: ['enter'],
      handle: addBr,
    },
  ]),
);

export const ShiftEnterBr = extend(
  Br,
  { is: compile('br') },
  withShortcuts([
    {
      name: 'addBr',
      shortcuts: ['shift + enter'],
      handle: addBr,
    },
  ]),
);
