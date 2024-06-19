import type * as IOO from 'fp-ts/lib/IOOption';
import * as O from 'fp-ts/lib/Option';

export const getSelection: IOO.IOOption<Selection> = () => {
  if (
    typeof window === 'undefined'
    || typeof window.getSelection !== 'function'
  ) {
    return O.none;
  }

  const selection = window.getSelection();

  if (!selection) {
    return O.none;
  }

  return O.some(selection);
};
