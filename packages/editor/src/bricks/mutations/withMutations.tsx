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

import { type MutationHandler } from './mutations';
import { MutationsContext, type MutationsContextType } from './MutationsContext';
import { revertDomByMutations } from './revertDomByMutations';

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  const WithMutations = (props: PropsWithoutRef<P>) => {
    const inheritedMutationsContext = useContext(MutationsContext);
    const hasInheritedContext = Boolean(inheritedMutationsContext);

    const ref = useRef<T>(null);
    const observerRef = useRef<MutationObserver>();
    const changesRef = useRef<unknown[]>([]);

    const trackChange = useCallback(function trackChange<Change>(change: Change) {
      changesRef.current.push(change);
      return change;
    }, []);

    const sortedElements = useRef<{ depth: number; mutate: MutationHandler }[]>([]);
    const subscribers = useRef(new Map<HTMLElement, MutationHandler>());

    useEffect(() => {
      if (hasInheritedContext || !ref.current) {
        return;
      }

      const observer = new MutationObserver((mutations) => {
        changesRef.current = [];
        sortedElements.current.forEach(({ mutate }) => { mutate({ type: 'before' }); });

        const defaultOptions = {
          remove: false,
          removedNodes: [],
          addedNodes: [],
          oldValue: null,
          type: 'mutate',
        };
        // eslint-disable-next-line -- check it
        const handleOptions = new Map<Node, any>();

        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (subscribers.current.has(node as HTMLElement)) {
              // eslint-disable-next-line -- check it
              const options = handleOptions.get(node) ?? { ...defaultOptions };
              // eslint-disable-next-line -- check it
              options.remove = true;
              handleOptions.set(node, options);
            }
          });

          let current: Node | null = mutation.target;

          while (current) {
            if (subscribers.current.has(current as HTMLElement)) {
              // eslint-disable-next-line -- check it
              const options = handleOptions.get(current) ?? { ...defaultOptions };

              // eslint-disable-next-line -- check it
              options.removedNodes.push(...Array.from(mutation.removedNodes));
              // eslint-disable-next-line -- check it
              options.addedNodes.push(...Array.from(mutation.addedNodes));

              handleOptions.set(current, options);
            }

            current = current.parentNode ?? null;
          }
        });

        handleOptions.forEach(
          // eslint-disable-next-line -- check it
          (options, node) => subscribers.current.get(node as HTMLElement)?.(options),
        );

        sortedElements.current.forEach(({ mutate }) => { mutate({ type: 'after' }); });

        if (changesRef.current.length) {
          revertDomByMutations(mutations);
          changesRef.current = [];
        }

        observer.takeRecords();
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

      return () => { observer.disconnect(); };
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
  }

  WithMutations.displayName = `WithMutations(${Component.displayName ?? 'Unnamed'})`;

  return WithMutations;
}
