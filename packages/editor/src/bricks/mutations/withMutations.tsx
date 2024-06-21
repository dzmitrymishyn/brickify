import {addRange, fromRangeLike, getRangeLike, type RangeLike} from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import React, {
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
import { MutationsContext, type MutationsContextType } from './MutationsContext';
import { revertDomByMutations } from './revertDomByMutations';

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  const WithMutations = (props: PropsWithoutRef<P>) => {
    const inheritedMutationsContext = useContext(MutationsContext);
    const hasInheritedContext = Boolean(inheritedMutationsContext);

    const ref = useRef<T>(null);
    const rangeRef = useRef<null | RangeLike>();
    const observerRef = useRef<MutationObserver>();
    const changesRef = useRef<unknown[]>([]);

    const trackChange = useCallback(function trackChange<Change>(change: Change) {
      changesRef.current.push(change);
      return change;
    }, []);

    const sortedElements = useRef<{ depth: number; mutate: MutationHandler }[]>([]);
    const subscribers = useRef(new Map<HTMLElement, MutationHandler>());

    useEffect(() => {
      if (!ref.current) {
        return;
      }

      const element: Element = ref.current;
      const events = [
        'keydown', 'keyup', 'input', 'change', 'paste', 'cut', 'click', 'dblclick', 'drop',
        'beforeInput',
      ];

      const saveSelection = () => {
        rangeRef.current = getRangeLike();
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
    }, []);

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
            } catch {
              // TODO: Add error handler
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
                const options = handleOptions.get(node) ?? { ...defaultOptions };
                options.remove = true;
                handleOptions.set(node, options);
              }
            });

            let current: Node | null = mutation.target;

            while (current) {
              if (subscribers.current.has(current as HTMLElement)) {
                const options = handleOptions.get(current) ?? { ...defaultOptions };

                options.removedNodes.push(...Array.from(mutation.removedNodes));
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
              } catch {
                // TODO: Add error handler
              }
            },
          );

          if (changesRef.current.length) {
            revertDomByMutations(mutations);
            pipe(rangeRef.current, fromRangeLike, addRange);
            rangeRef.current = null;
            changesRef.current = [];
          }

          sortedElements.current.forEach(({ mutate }) => {
            try {
              mutate({ type: 'after' });
            } catch {
              // TODO: Add error handler
            }
          });
        } catch {
          // TODO: Add error handler
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
    }, [hasInheritedContext]);

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
      }),
      [subscribe, clear, trackChange],
    );

    return (
      <MutationsContext.Provider value={inheritedMutationsContext ?? contextValue}>
        <Component ref={ref} {...props} />
      </MutationsContext.Provider>
    );
  };

  WithMutations.displayName = `WithMutations(${Component.displayName ?? 'Unnamed'})`;

  return WithMutations;
}
