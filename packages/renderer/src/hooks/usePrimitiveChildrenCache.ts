import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const usePrimitiveChildrenCache = () => {
  const store = useRef<Record<string, { value: unknown }>>({});
  const renderCache = useRef<Record<string, { value: unknown }>>({});
  const [updater, setUpdater] = useState<number>();

  const get = useCallback(
    <T>(index: string, previousValue: T): { value: T } | undefined => {
      return renderCache.current[index]?.value === previousValue
        ? renderCache.current[index] as { value: T }
        : undefined;
    },
    [],
  );

  const save = useCallback(<T>(index: string, value: T): { value: T } => {
    if (store.current[index]?.value !== value) {
      store.current[index] = { value };
      setUpdater(Math.random());
    }
    return store.current[index] as { value: T };
  }, []);

  useLayoutEffect(() => {
    renderCache.current = {
      ...store.current,
    };
  }, [updater]);

  return useMemo(() => ({ get, save }), [get, save]);
};
