import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { MutationHandler } from './mutations';
import { MutationsContext } from './MutationsContext';

// type MutationHandle = {
// };

// type Options2 = {
//   before(): void;
//   mutate(options: {
//     remove: boolean;
//     addedNodes: Node[];
//     removedNodes: Node[];
//     oldValue: string | null;
//   }): void;
//   after(): void;
// };

type Options = Partial<Record<MutationRecordType | 'before' | 'after', MutationHandler>>;

export const useMutation = <Element extends HTMLElement>(
  mutations: Options,
): RefObject<Element> => {
  const { subscribe } = useContext(MutationsContext) || {};

  if (!subscribe) {
    // TODO: Add logger execution
    // eslint-disable-next-line no-console
    console.error('You cannot subscribe on new mutations without the context');
  }

  const mutationsRef = useRef(mutations);
  const ref = useRef<Element>(null);

  mutationsRef.current = mutations;

  const mutate = useCallback<MutationHandler>(
    (mutation) => mutationsRef.current[mutation.type]?.(mutation),
    [],
  );

  useEffect(() => {
    if (!subscribe) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return subscribe(ref.current!, mutate);
  }, [mutate, subscribe]);

  return ref;
};
