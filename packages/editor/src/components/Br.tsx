import { isElementWithinRange } from '@brickifyio/browser/selection';
import { isText } from '@brickifyio/browser/utils';
import { compile } from 'css-select';
import React from 'react';

import { extend } from '../bricks';
import { shortcuts } from '../bricks/utils/shortcuts';
import { type HandleCommandOptions } from '../core/commands';

const Br: React.FC = () => <br />;

const addBr = ({ range, results, element }: HandleCommandOptions) => {
  const newRange = range();

  if (newRange && isElementWithinRange(element, newRange)) {
    const brNode = document.createElement('br');

    newRange.extractContents();
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

    return true;
  }

  return false;
};

export default extend(
  Br,
  { is: compile('br') },
  shortcuts({
    reshape: {
      shortcuts: ['enter'],
      handle: addBr,
    },
  }),
);

export const ShiftEnterBr = extend(
  Br,
  { is: compile('br') },
  shortcuts({
    reshape: {
      shortcuts: ['shift + enter'],
      handle: addBr,
    },
  }),
);
