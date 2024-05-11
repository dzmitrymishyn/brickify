import {
  createContext,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { revertDomByMutations } from './revertDomByMutations';

// TODO: any...
export type MutationHandler = (mutation: MutationRecord) => any;

type Unsubscribe = () => void;

type Subscribe = (
  element: HTMLElement,
  mutate: MutationHandler,
) => Unsubscribe;

type HandleResults = (updatedValues: unknown[]) => void;
export type MutationsContextType = {
  subscribe: Subscribe;
  // TODO: Come up with fine name
  clear: () => void;
  setHandleResults: (fn: HandleResults) => void;
};

export const MutationsContext = createContext<MutationsContextType | null>(null);

MutationsContext.displayName = 'MutationsContext';

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  const WithMutations = (props: PropsWithoutRef<P>) => {
    const ref = useRef<T>(null);
    const observerRef = useRef<MutationObserver>();

    const handleResultsRef = useRef<null | HandleResults>(null);
    const setHandleResults = useCallback((fn: HandleResults) => {
      handleResultsRef.current = fn;
    }, []);

    const subscribers = useRef(new Map<HTMLElement, MutationHandler>());

    useEffect(() => {
      const observer = new MutationObserver((mutations) => {
        const results: unknown[] = [];
        mutations.forEach((mutation) => {
          let { target } = mutation;
          const noValue = Symbol('no value');
          let result: unknown = noValue;

          while (result === noValue && target) {
            while (target && !subscribers.current.has(target as HTMLElement)) {
              target = target.parentNode as HTMLElement;
            }

            if (!target) {
              return;
            }

            result = subscribers.current.get(target as HTMLElement)?.(mutation)
              ?? noValue;
            target = target.parentNode as HTMLElement;
          }

          if (result !== noValue) {
            results.push(result);
          }
        });

        if (results.length) {
          revertDomByMutations(mutations);
          // TODO: As I said in the Editor it's bad to handle the changes in such way
          handleResultsRef.current?.(results);
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
    }, []);

    const subscribe = useCallback<MutationsContextType['subscribe']>(
      (element, mutate) => {
        subscribers.current.set(element, mutate);

        return () => subscribers.current.delete(element);
      },
      [],
    );

    const clear = useCallback(() => {
      observerRef.current?.takeRecords();
    }, []);

    const contextValue = useMemo(
      () => ({ subscribe, setHandleResults, clear }),
      [subscribe, setHandleResults, clear],
    );

    return (
      <MutationsContext.Provider value={contextValue}>
        <Component ref={ref} {...props} />
      </MutationsContext.Provider>
    );
  };

  WithMutations.displayName = `WithMutations(${Component.displayName})`;

  return WithMutations;
}
