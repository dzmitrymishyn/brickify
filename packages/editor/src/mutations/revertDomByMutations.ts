import { tap } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

type MutationHandler = (mutation: MutationRecord) => void;
type HandlersMap = Record<MutationRecordType, MutationHandler>;

const mutationHandlers: HandlersMap = {
  characterData: (mutation) => {
    // DOM mutation to revert changes
    mutation.target.textContent = mutation.oldValue;
  },
  childList: flow(
    tap((mutation) => (
      mutation.removedNodes.length
      && mutation.target.insertBefore(
        mutation.removedNodes[0],
        mutation.nextSibling,
      )
    )),
    tap((mutation) => (
      mutation.addedNodes.length && mutation.addedNodes.forEach(
        (node) => mutation.target.removeChild(node)
      )
    )),
  ),
  attributes: (mutation) => {
    const name = mutation.attributeName ?? '';
    const target = mutation.target as HTMLElement;
    if (!mutation.oldValue) {
      target.removeAttribute(name);
    } else {
      target.setAttribute(name, mutation.oldValue);
    }
  },
};

export const revertDomByMutations = flow<[MutationRecord[]], void>(
  // To make it work in a right way we have to iterate from the end of the
  // list. I didn't find a way to just traverse from the end so I just use
  // `.reduceRight`. I don't really like to perform `.reverse` or use any map
  // function that will create an additional array. I just use `.reduce` and
  // return `undefined`
  A.reduceRight(undefined, flow(
    O.fromNullable,
    O.bindTo('mutation'),
    O.bind('handle', ({ mutation }) => O.fromNullable(
      mutationHandlers[mutation.type],
    )),
    O.map(({ mutation, handle }) => handle(mutation)),
    O.getOrElseW(() => undefined),
  )),
);
