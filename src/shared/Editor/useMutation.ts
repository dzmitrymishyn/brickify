import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import { MutationHandler, MutationsContext } from './withMutations';

type Options = Partial<Record<MutationRecordType, MutationHandler>>;

export const useMutation = <Element extends HTMLElement>(
  mutations: Options,
): RefObject<Element> => {
  const { subscribe } = useContext(MutationsContext) || {};

  if (!subscribe) {
    console.error('You cannot subscribe on new mutations without the context');
  }

  const mutationsRef = useRef(mutations);
  const ref = useRef<Element>(null);

  mutationsRef.current = mutations;

  const mutate = useCallback(
    (mutation: MutationRecord) => mutationsRef.current[mutation.type]?.(mutation),
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
