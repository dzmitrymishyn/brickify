import { addRange, fromRangeLike } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { useCallback, useEffect, useRef } from 'react';

import {
  type MutationHandler,
  type MutationMutate,
} from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { type BeforeAfterRangesController } from '../hooks/useBeforeAfterRanges';
import { useBrickContextUnsafe } from '../hooks/useBrickContext';
import { type ChangesController } from '../hooks/useChanges';

export const useMutationsController = (
  rangesController: BeforeAfterRangesController,
  changesController: ChangesController,
) => {
  const inheritedContext = useBrickContextUnsafe();
  const hasInheritedContext = Boolean(inheritedContext);
  const ref = useRef<Element>(null);

  const observerRef = useRef<MutationObserver>();
  const subscribersRef = useRef(
    new Map<HTMLElement, MutationHandler>(),
  );
  const sortedElements = useRef<{
    depth: number;
    mutate: MutationHandler;
  }[]>([]);

  useEffect(() => {
    if (hasInheritedContext || !ref.current) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      try {
        changesController.clear();
        sortedElements.current.forEach(({ mutate }) => {
          try {
            mutate({ type: 'before' });
          } catch (error) {
            // logger.error(
            //   'Something was broken before mutations handler',
            //   error,
            // );
          }
        });

        const defaultOptions: MutationMutate = {
          remove: false,
          removedNodes: [],
          addedNodes: [],
          type: 'mutate',
        };
        const handleOptions = new Map<Node, MutationMutate>();

        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (subscribersRef.current.has(node as HTMLElement)) {
              const options = handleOptions.get(node)
                ?? { ...defaultOptions };
              options.remove = true;
              handleOptions.set(node, options);
            }
          });

          let current: Node | null = mutation.target;

          while (current) {
            if (subscribersRef.current.has(current as HTMLElement)) {
              const options = handleOptions.get(current)
                ?? { ...defaultOptions };

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
              subscribersRef.current.get(node as HTMLElement)?.(options);
            } catch (error) {
              // logger.error('Current mutation handler was broken', error);
            }
          },
        );

        sortedElements.current.forEach(({ mutate }) => {
          try {
            mutate({ type: 'after' });
          } catch (error) {
            // logger.error(
            //   'Something was broken after mutations handler',
            //   error,
            // );
          }
        });

        if (changesController.get().length) {
          rangesController.saveAfter();
          revertDomByMutations(mutations);
          pipe(
            rangesController.getBefore(),
            fromRangeLike,
            addRange,
            () => rangesController.clearBefore(),
          );
          changesController.clear();
        }
      } catch (error) {
        // logger.log('The mutations observer works incorrect', error);
      } finally {
        observer.takeRecords();
      }
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
  }, [hasInheritedContext, rangesController]);

  const subscribe = useCallback(
    (element: HTMLElement, mutate: MutationHandler) => {
      subscribersRef.current.set(element, mutate);

      let depth = 0;
      let current: Node | null = element;

      while (current) {
        depth += 1;
        current = current.parentNode;
      }

      const elementToSort = { depth, mutate };

      sortedElements.current.push(elementToSort);
      // TODO: Use priority queue or a linked list
      sortedElements.current.sort((a, b) => b.depth - a.depth);

      return () => {
        subscribersRef.current.delete(element);

        const index = sortedElements.current.indexOf(elementToSort);
        if (index >= 0) {
          sortedElements.current.splice(index, 1);
        }
      };
    },
    [],
  );

  const clear = useCallback(() => {
    observerRef.current?.takeRecords();
  }, []);

  return {
    subscribe,
    clear,
    ref,
  };
};
