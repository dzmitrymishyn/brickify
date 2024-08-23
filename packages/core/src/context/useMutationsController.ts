import { addRange, fromRangeLike } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { useCallback, useEffect, useRef } from 'react';

import { type BeforeAfterRangesController } from './useBeforeAfterRanges';
import { type ChangesController } from '../changes';
import { type Mutation, type MutationHandler, revertDomByMutations } from '../mutations';
import { type BrickStore } from '../store';
import assert from 'assert';

type UseMutationsControllerOptions = {
  rangesController: BeforeAfterRangesController;
  changesController: ChangesController;
  store: BrickStore;
};

export const useMutationsController = ({
  rangesController,
  changesController,
  store,
}: UseMutationsControllerOptions) => {
  const ref = useRef<Element>(null);

  const observerRef = useRef<MutationObserver>();

  const handle = useCallback((mutations: MutationRecord[]) => {
    try {
      const defaultOptions: Omit<Mutation, 'target'> = {
        remove: false,
        removedNodes: [],
        addedNodes: [],
      };
      const handleOptions = new Map<Node, Mutation>();

      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          const storedElement = store.get(node);
          if (storedElement) {
            const options = handleOptions.get(node)
              ?? { ...defaultOptions, target: node };
            options.remove = true;
            handleOptions.set(node, options);
          }
        });

        let current: Node | null = mutation.target;

        while (current) {
          const storedElement = store.get(current);
          if (storedElement) {
            const options = handleOptions.get(current)
              ?? { ...defaultOptions, target: current };

            options.removedNodes.push(
              ...Array.from(mutation.removedNodes),
            );
            options.addedNodes.push(...Array.from(mutation.addedNodes));

            handleOptions.set(current, options);
          }

          current = current.parentNode ?? null;
        }
      });

      handleOptions.forEach(
        (options, node) => {
          try {
            changesController.markForApply(options.target);
            store.get(node)?.mutate?.(options);
          } catch (error) {
            // TODO: Add logger
          }
        },
      );

      if (changesController.changes().length) {
        rangesController.saveAfter();
        revertDomByMutations(mutations);
        pipe(
          rangesController.getBefore(),
          fromRangeLike,
          addRange,
          () => rangesController.clearBefore(),
        );
        observerRef.current?.takeRecords();
      }
    } catch (error) {
      // TODO: Add logger
    }
  }, [rangesController, changesController, store]);

  useEffect(() => {
    assert(
      ref.current,
      'useMutationsController: ref should be attached to a node',
    );

    const observer = new MutationObserver((mutations) => {
      changesController.handle(handle)(mutations);
    });

    observer.observe(ref.current, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [changesController, handle]);

  const subscribe = useCallback(
    (element: HTMLElement, mutate: MutationHandler) => {
      store.update(element, { mutate });

      return () => {
        store.update(element, { mutate: undefined });
      };
    },
    [store],
  );

  const clear = useCallback(() => {
    return observerRef.current?.takeRecords();
  }, []);

  return {
    subscribe,
    clear,
    handle,
    ref,
  };
};

export type MutationsController = ReturnType<typeof useMutationsController>;
