import { useCallback, useEffect, useRef } from 'react';

type Options = Partial<Record<MutationRecordType, (mutation: MutationRecord) => boolean>>;

const register = (
  element: Element,
  mutate: (mutation: MutationRecord) => boolean,
) => {
  // console.log(element, mutate);
};

export const useMutation = <Element extends HTMLElement>(mutations: Options) => {
  const mutationsRef = useRef(mutations);
  const ref = useRef<Element>(null);

  mutationsRef.current = mutations;

  const mutate = useCallback(
    (mutation: MutationRecord) => !!mutationsRef.current[mutation.type]?.(mutation),
    [],
  );

  useEffect(() => {
    register(ref.current!, mutate);
  }, [mutate]);

  return ref;
};
