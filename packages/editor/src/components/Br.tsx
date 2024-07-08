import { isElementWithinRange } from '@brickifyio/browser/selection';
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
