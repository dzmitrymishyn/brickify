import { tap } from '@brickifyio/operators';
import {
  type BrickValue,
  createUsePlugin,
  type PropsWithStoredValue,
  type UsePluginFactory,
} from '@brickifyio/renderer';
import { useSyncedRef } from '@brickifyio/utils/hooks';
import { type Change, patch } from '@brickifyio/utils/object';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  type RefObject,
  useMemo,
} from 'react';

import { type PropsWithChange } from './models';

export const changesToken = Symbol('ChangesPlugin');

const createController = (
  valueRef: RefObject<{ value: BrickValue[] }>,
  onChangeRef: RefObject<undefined | ((value: object) => void)>,
) => {
  let changes: Change[] = [];

  const clear = () => {
    changes = [];
  };

  const emitChanges = (newChanges: Change[]) => pipe(
    newChanges.length
      ? O.some(patch(valueRef.current, newChanges))
      : O.none,
    O.map(tap(flow(
      ([value]) => value?.value ?? [],
      // eslint-disable-next-line no-console -- use logger
      tap<BrickValue[]>(console.log.bind(null, 'next value')),
      (value) => onChangeRef.current?.(value),
    ))),
  );

  const apply = () => pipe(
    emitChanges(changes),
    // O.map(tap(([, b]) => console.log(...[
    //   ...changes.map((c) => ({...c, path: c.path?.join('/')})),
    // ]))),
    // O.map(tap(([, b]) => console.log(...[
    //   ...b.map((c) => ({...c, path: c.path?.join('/')})),
    // ]))),
    // O.map(tap(([, b]) => {
    //   window.asd = { forward: changes, backward: b };
    // })),
    tap(clear),
  );

  const onChange = <Value = unknown>(event: Change<Value>) => {
    if (!event.path) {
      return;
    }

    /**
     * If it's a single onChange not in mutations or commands we just call
     * the apply function on the next render.
     */
    if (!changes.length) {
      requestAnimationFrame(apply);
    }

    changes.push(event);
  };

  return {
    changes: () => changes,

    add: <Value = unknown>(path: string[], value: Value) => {
      onChange({ type: 'add', path, value });
    },

    remove: (path: string[]) => onChange({ type: 'remove', path }),

    apply,

    onChange,
  };
};

export type ChangesController = ReturnType<
  typeof createController
>;

type Props = {
  onChange?: (value: object) => void;
  value: BrickValue[];
};

export const useChangesPluginFactory: UsePluginFactory<
  Props,
  ChangesController
> = (props) => {
  const onChangeRef = useSyncedRef(props.onChange);
  const valueRef = useSyncedRef({ value: props.value });

  const controller = useMemo(
    () => createController(valueRef, onChangeRef),
    [valueRef, onChangeRef],
  );

  return useMemo(() => ({
    token: changesToken,
    props: {
      /**
       * We mutate current root props with new onChange method that can
       * interract with the whole object. Children components must implement
       * plugin interface for change function
       */
      onChange: controller.onChange,
    },
    /**
     * Each element will have onChange function.
     * If an element already has this function we don't need to override it.
     */
    render: (element: ReactElement<PropsWithChange & PropsWithStoredValue>) => {
      if (element.props.onChange) {
        return element;
      }

      return cloneElement(element, {
        onChange: (
          value: unknown,
          pathSuffix: string[] = [],
        ) => controller.onChange({
          path: [...element.props.stored.pathRef.current(), ...pathSuffix],
          type: value === undefined ? 'remove' : 'update',
          value,
        }),
      });
    },
    controller,
  }), [controller]);
};

export const useChanges = createUsePlugin<ChangesController>(changesToken);
