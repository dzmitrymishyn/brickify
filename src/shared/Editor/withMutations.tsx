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

export type MutationHandler = (mutation: MutationRecord) => boolean | undefined | null | void;

type Unsubscribe = () => void;

type Subscribe = (
  element: HTMLElement,
  mutate: MutationHandler,
) => Unsubscribe;

export type MutationsContextType = {
  subscribe: Subscribe;
};

export const MutationsContext = createContext<MutationsContextType | null>(null);

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  return (props: PropsWithoutRef<P>) => {
    const ref = useRef<T>(null);

    const subscribers = useRef(
      new Map<HTMLElement, MutationHandler>(),
    );

    useEffect(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          let { target } = mutation;
          let handled = false;

          while (!handled && target) {
            while (target && !subscribers.current.has(target as HTMLElement)) {
              target = target.parentNode as HTMLElement;
            }

            if (!target) {
              return;
            }

            handled = !!subscribers.current.get(target as HTMLElement)?.(mutation);
            target = target.parentNode as HTMLElement;
          }
        });

        revertDomByMutations(mutations);
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

      return () => observer.disconnect();
    }, []);

    const subscribe = useCallback<MutationsContextType['subscribe']>((element, mutate) => {
      subscribers.current.set(element, mutate);

      return () => subscribers.current.delete(element);
    }, []);

    const contextValue = useMemo(
      () => ({ subscribe }),
      [subscribe],
    );

    return (
      <MutationsContext.Provider value={contextValue}>
        <Component ref={ref} {...props} />
      </MutationsContext.Provider>
    );
  };
}
