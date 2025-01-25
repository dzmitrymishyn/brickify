import { tap } from '@brickifyio/operators';
import {
  type BrickValue,
  createUsePlugin,
  type Plugin,
  type PropsWithStoredValue,
} from '@brickifyio/renderer';
import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type Change, patch } from '@brickifyio/utils/object';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { type PropsWithChange } from './models';

export const changesToken = Symbol('ChangesPlugin');

type Props = {
  onChange?: (value: object) => void;
  value: BrickValue[];
};

export const useChangesPluginFactory = (props: Props) => {
  const ref = useRef<HTMLElement>(null);
  const onChangeRef = useSyncedRef(props.onChange);
  const valueRef = useSyncedRef({ value: props.value });

  const changesRef = useRef<Change[]>([]);
  // TODO: move it to history plugin
  const activeIndexRef = useRef(-1);
  const historyRef = useRef<{ forward: Change[]; backward: Change[]}[]>([]);

  const clear = useCallback(() => {
    changesRef.current = [];
  }, []);

  const emitChanges = useCallback((newChanges: Change[]) => pipe(
    newChanges.length
      ? O.some(patch(valueRef.current, newChanges))
      : O.none,
    O.map(tap(flow(
      ([value]) => value?.value ?? [],
      // eslint-disable-next-line no-console -- use logger
      tap<BrickValue[]>(console.log.bind(null, 'next value')),
      (value) => onChangeRef.current?.(value),
    ))),
  ), [onChangeRef, valueRef]);

  const apply = useCallback(() => pipe(
    emitChanges(changesRef.current),
    O.map(tap(([_, changesToRevert]) => {
      historyRef.current = historyRef.current.slice(
        0,
        activeIndexRef.current + 1,
      );
      activeIndexRef.current += 1;
      historyRef.current.push({
        backward: changesToRevert,
        forward: changesRef.current,
      });
    })),
    tap(clear),
  ), [clear, emitChanges]);

  const onChange = useCallback(<Value>(event: Change<Value>) => {
    if (!event.path) {
      return;
    }

    /**
     * If it's a single onChange not in mutations or commands we just call
     * the apply function on the next render.
     */
    if (!changesRef.current.length) {
      requestAnimationFrame(apply);
    }

    changesRef.current.push(event);
  }, [apply]);


  const undo = useCallback(() => {
    if (activeIndexRef.current < 0) {
      return;
    }

    emitChanges(historyRef.current[activeIndexRef.current].backward);
    activeIndexRef.current -= 1;
  }, [emitChanges]);;

  const redo = useCallback(() => {
    if (activeIndexRef.current >= historyRef.current.length - 1) {
      return;
    }

    emitChanges(historyRef.current[activeIndexRef.current + 1].forward);
    activeIndexRef.current += 1;
  }, [emitChanges]);

  const add = useCallback(<Value = unknown>(path: string[], value: Value) => {
    onChange({ type: 'add', path, value });
  }, [onChange]);

  const remove = useCallback(
    (path: string[]) => onChange({ type: 'remove', path }),
    [onChange],
  );

  useEffect(() => {
    const abort = new AbortController();
    ref.current?.addEventListener('beforeinput', (event) => {
      if (event.inputType === 'historyUndo') {
        event.preventDefault();
        undo();
      }

      if (event.inputType === 'historyRedo') {
        event.preventDefault();
        redo();
      }
    }, { signal: abort.signal });

    return () => abort.abort();
  }, [undo, redo]);

  return useMemo(() => ({
    token: changesToken,
    root: {
      ref,
      props: { onChange },
    },
    /**
     * Each element will have onChange function.
     * If an element already has this function we don't need to override it.
     */
    render: (
      element: ReactElement<PropsWithChange & PropsWithStoredValue>,
    ) => {
      if (element.props.onChange) {
        return element;
      }

      return cloneElement(element, {
        onChange: (
          value: unknown,
          pathSuffix: string[] = [],
        ) => onChange({
          path: [...element.props.stored.pathRef.current(), ...pathSuffix],
          type: value === undefined ? 'remove' : 'update',
          value,
        }),
      });
    },
    undo,
    redo,
    onChange,
    apply,
    add,
    remove,
  }), [add, apply, onChange, redo, remove, undo]);
};

export type ChangesPlugin = Plugin<typeof useChangesPluginFactory>;

export const useChangesPlugin = createUsePlugin<ChangesPlugin>(changesToken);
