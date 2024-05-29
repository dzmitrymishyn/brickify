import {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { MutationHandler } from './mutations';
import { MutationsContext, MutationsContextType } from './MutationsContext';
import { revertDomByMutations } from './revertDomByMutations';

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  const WithMutations = (props: PropsWithoutRef<P>) => {
    const inheritedMutationsContext = useContext(MutationsContext);
    const hasInheritedContext = !!inheritedMutationsContext;

    const ref = useRef<T>(null);
    const observerRef = useRef<MutationObserver>();
    const changesRef = useRef<unknown[]>([]);

    // eslint-disable-next-line prefer-arrow-callback
    const trackChange = useCallback(function trackChange<Change>(change: Change) {
      changesRef.current.push(change);
      return change;
    }, []);

    const sortedElements = useRef<{ depth: number; mutate: MutationHandler }[]>([]);
    const subscribers = useRef(new Map<HTMLElement, MutationHandler>());

    useEffect(() => {
      if (hasInheritedContext) {
        // TODO: ... Remove it
        return () => {};
      }

      const observer = new MutationObserver((mutations) => {
        changesRef.current = [];
        sortedElements.current.forEach(({ mutate }) => mutate({ type: 'before' }));

        const defaultOptions = {
          remove: false,
          removedNodes: [],
          addedNodes: [],
          oldValue: null,
          type: 'mutate',
        };
        const handleOptions = new Map<Node, any>();

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
          (options, node) => subscribers.current.get(node as HTMLElement)?.(options),
        );

        // const handled = new Set();

        // debugger;
        // mutations.forEach((mutation) => {
        //   const { target } = mutation;
        //   // const { target, removedNodes } = mutation;

        //   // // eslint-disable-next-line no-restricted-syntax
        //   // for (const removed of removedNodes.values()) {
        //   //   if (subscribers.current.has(removed as HTMLElement)) {
        //   //     const handler = subscribers.current.get(removed as HTMLElement);
        //   //     handler?.(mutation);

        //   //     return;
        //   //   }
        //   // }

        //   let current: Node | null = target;

        //   while (current) {
        //     if (subscribers.current.has(current as HTMLElement)) {
        //       if (handled.has(current)) {
        //         return;
        //       }

        //       handled.add(current);

        //       const handler = subscribers.current.get(current as HTMLElement);
        //       const needParentHandle = !!handler?.(mutation);

        //       if (!needParentHandle) {
        //         break;
        //       }
        //     }

        //     current = current.parentNode ?? null;
        //   }
        // });

        sortedElements.current.forEach(({ mutate }) => mutate({ type: 'after' }));

        if (changesRef.current.length) {
          revertDomByMutations(mutations);
          changesRef.current = [];
        }

        observer?.takeRecords();
      });

      observer.observe(ref.current!, {
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
      <MutationsContext.Provider value={inheritedMutationsContext || contextValue}>
        <Component ref={ref} {...props} />
      </MutationsContext.Provider>
    );
  };

  WithMutations.displayName = `WithMutations(${Component.displayName})`;

  return WithMutations;
}
