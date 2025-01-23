import { useEffect, useMemo } from 'react'

export const useAbortController = () => {
  const controller = useMemo(() => new AbortController(), []);

  useEffect(() => {
    return () => {
      controller.abort('unmount');
    };
  }, []);

  return controller;
};
