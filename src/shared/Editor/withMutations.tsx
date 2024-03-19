import {
  createContext,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useEffect,
  useRef,
} from 'react';

import { revertDomByMutations } from './revertDomByMutations';

export type MutationsContextType = {
  register(
    element: Element,
    mutate: (mutation: MutationRecord) => boolean,
  ): void;
};

export const MutationsContext = createContext<MutationsContextType | null>(null);

export function withMutations<P, T extends Element>(
  Component: ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>,
) {
  return (props: PropsWithoutRef<P>) => {
    const ref = useRef<T>(null);

    useEffect(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          let { target } = mutation;

          while (target && !(target as any).brick && ref.current !== target) {
            target = target.parentNode as Node;
          }

          if (!target || ref.current === target) {
            return;
          }

          const { brick } = (target as any);

          brick?.mutate(mutation);
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

    return (
      <Component ref={ref} {...props} />
    );
  };
}
