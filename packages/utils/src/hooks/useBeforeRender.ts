import { useEffect, useRef } from 'react'

/**
 * useBeforeRender allows you to execute some code right before a render.
 * It runs even before the children will be rendered. There is
 * useLayoutEffect that's supposed to run in the same situations but it
 * waits for children renders. This hook calls before all the children
 * renders
 */
export const useBeforeRender = (fn: () => void, deps: unknown[]) => {
  const storedDeps = useRef<unknown[]>([]);

  if (
    deps.length !== storedDeps.current.length
    || deps.some((item, index) => storedDeps.current[index] !== item)
  ) {
    fn();
  }

  useEffect(() => {
    storedDeps.current = deps;
  }, deps);
};
