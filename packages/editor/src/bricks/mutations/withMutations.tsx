import {
  addRange,
  type CustomRange,
  fromRangeLike,
  getRange,
  getRangeLike,
  type RangeLike,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { type MutationHandler, type MutationMutate } from './mutations';
import {
  MutationsContext,
  type MutationsContextType,
} from './MutationsContext';
import { revertDomByMutations } from './revertDomByMutations';
import { useLogger } from '../../core';

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  const WithMutations = (props: PropsWithoutRef<P>) => {
    const logger = useLogger();
    const inheritedMutationsContext = useContext(MutationsContext);
    const hasInheritedContext = Boolean(inheritedMutationsContext);

    const ref = useRef<T>(null);
    const beforeMutationRangeRef = useRef<null | RangeLike>();
    const afterMutationRangeRef = useRef<null | CustomRange>();
    const observerRef = useRef<MutationObserver>();
    const changesRef = useRef<unknown[]>([]);

    const trackChange = useCallback(function trackChange<C>(change: C) {
      changesRef.current.push(change);
      return change;
    }, []);

    const sortedElements = useRef<{
      depth: number;
      mutate: MutationHandler;
    }[]>([]);
    const subscribers = useRef(new Map<HTMLElement, MutationHandler>());

    useEffect(() => {
      if (!ref.current || hasInheritedContext) {
        return;
      }

      const element: Element = ref.current;
      const events = [
        'keydown', 'keyup', 'input', 'change', 'paste', 'cut', 'click',
        'dblclick', 'drop', 'beforeInput',
      ];

      const saveSelection = () => {
        beforeMutationRangeRef.current = getRangeLike();
      };

      // Add event listeners to save the selection range before any mutation
      events.forEach(
        (event) => element.addEventListener(event, saveSelection, true),
      );

      return () => {
        events.forEach(
          (event) => element.removeEventListener(event, saveSelection, true),
        );
      };
    }, [hasInheritedContext]);

    useEffect(() => {
      if (hasInheritedContext || !ref.current) {
        return;
      }

      const observer = new MutationObserver((mutations) => {
        try {
          changesRef.current = [];
          sortedElements.current.forEach(({ mutate }) => {
            try {
              mutate({ type: 'before' });
            } catch (error) {
              logger.error(
                'Something was broken before mutations handler',
                error,
              );
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
              if (subscribers.current.has(node as HTMLElement)) {
                const options = handleOptions.get(node)
                  ?? { ...defaultOptions };
                options.remove = true;
                handleOptions.set(node, options);
              }
            });

            let current: Node | null = mutation.target;

            while (current) {
              if (subscribers.current.has(current as HTMLElement)) {
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
                subscribers.current.get(node as HTMLElement)?.(options);
              } catch (error) {
                logger.error('Current mutation handler was broken', error);
              }
            },
          );

          if (changesRef.current.length) {
            afterMutationRangeRef.current = pipe(
              getRange(),
              toCustomRange(ref.current!),
            );
            revertDomByMutations(mutations);
            pipe(beforeMutationRangeRef.current, fromRangeLike, addRange);
            beforeMutationRangeRef.current = null;
            changesRef.current = [];
          }

          sortedElements.current.forEach(({ mutate }) => {
            try {
              mutate({ type: 'after' });
            } catch (error) {
              logger.error(
                'Something was broken after mutations handler',
                error,
              );
            }
          });
        } catch (error) {
          logger.log('The mutations observer works incorrect', error);
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
    }, [hasInheritedContext, logger]);

    const subscribe = useCallback<MutationsContextType['subscribe']>(
      (element, mutate) => {
        subscribers.current.set(element, mutate);
        let depth = 0;
        let current: Node | null = element;

        while (current) {
          depth += 1;
          current = current.parentNode;
        }

        const elementToSort = { depth, mutate };

        sortedElements.current.push(elementToSort);
        // TODO: Use priority queue
        sortedElements.current.sort((a, b) => b.depth - a.depth);

        return () => {
          subscribers.current.delete(element);

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

    const contextValue = useMemo(
      () => ({
        subscribe,
        clear,
        trackChange,
        afterMutationRange() {
          return afterMutationRangeRef.current;
        },
      }),
      [subscribe, clear, trackChange],
    );

    return (
      <MutationsContext.Provider
        value={inheritedMutationsContext ?? contextValue}
      >
        <Component ref={ref} {...props} />
      </MutationsContext.Provider>
    );
  };

  WithMutations.displayName = (
    `WithMutations(${Component.displayName ?? 'Unnamed'})`
  );

  return WithMutations;
}
