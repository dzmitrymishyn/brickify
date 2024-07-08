import { addRange, fromRangeLike } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { useCallback, useEffect, useRef } from 'react';

import {
  type Mutation,
  type MutationHandler,
} from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { type ChangesController } from '../changes';
import { type BeforeAfterRangesController } from '../hooks/useBeforeAfterRanges';
import { useBrickContextUnsafe } from '../hooks/useBrickContext';
import { type Logger } from '../logger';

type UseMutationsControllerOptions = {
  rangesController: BeforeAfterRangesController;
  changesController: ChangesController;
  logger?: Logger;
};

export const useMutationsController = ({
  rangesController,
  changesController,
  logger,
}: UseMutationsControllerOptions) => {
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

    let wereChanges = false;
    const observer = new MutationObserver((mutations) => {
      wereChanges = false;
      try {
        logger?.group?.(`Mutations were detected at ${Date.now()}`);

        changesController.startBatch();

        const defaultOptions: Mutation = {
          remove: false,
          removedNodes: [],
          addedNodes: [],
        };
        const handleOptions = new Map<Node, Mutation>();

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
              const result = subscribersRef.current.get(
                node as HTMLElement,
              )?.(options);

              if (result) {
                wereChanges = wereChanges || result;
              }
            } catch (error) {
              logger?.error('Current mutation handler was broken', error);
            }
          },
        );

        if (wereChanges) {
          rangesController.saveAfter();
          revertDomByMutations(mutations);
          pipe(
            rangesController.getBefore(),
            fromRangeLike,
            addRange,
            () => rangesController.clearBefore(),
          );
          logger?.log('The DOM was restored since there are mutations');
        } else {
          logger?.log(
            'Mutations were ignored since there are no registered changes',
          );
        }
      } catch (error) {
        logger?.error('The mutations observer works incorrect', error);
      } finally {
        observer.takeRecords();
        changesController.applyBatch();
        logger?.groupEnd?.();
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
  }, [hasInheritedContext, rangesController, changesController, logger]);

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
