import { tap } from '@brickifyio/operators';
import {
  type BrickValue,
  createUsePlugin,
  type UsePluginFactory,
} from '@brickifyio/renderer';
import { patch } from '@brickifyio/utils/object';
// import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { type Change, type PropsWithChange } from './models';

export const changesToken = Symbol('ChangesPlugin');

const createController = (
  valueRef: RefObject<{ value: BrickValue[] }>,
  onChangeRef: RefObject<undefined | ((value: object) => void)>,
) => {
  // const applyHandlers = new Map<Node, () => void>();

  let changes: Change[] = [];
  // let markedForChanges: Node[] = [];

  const clear = () => {
    changes = [];
    // markedForChanges = [];
  };

  /**
   * When we apply current changes we go through markedForChanges elements
   * and call apply function in each element if it exists. After that we
   * patch current value with the updates and pass it to the parent component
   */
  const apply = () => pipe(
    // markedForChanges,
    // A.reduce(new Set<Node>(), (handledNodes, node: Node) => {
    //   if (!handledNodes.has(node)) {
    //     handledNodes.add(node);
    //     applyHandlers.get(node)?.();
    //   }

    //   return handledNodes;
    // }),
    changes.length && valueRef.current
      ? patch(valueRef.current, changes)
      : null,
    O.fromNullable,
    O.map(([{ value }]) => value as object),
    // eslint-disable-next-line no-console -- TODO: Replace it with logger
    O.map(tap<object>(console.log.bind(null, 'new value'))),
    O.map((value) => onChangeRef.current?.(value)),
    tap(clear),
  );

  return {
    changes: () => changes,

    // markForApply: (node?: Node) => {
    //   if (node) {
    //     markedForChanges.push(node);
    //   }
    // },

    handle: <T>(fn?: (params: T) => void) => (params: T) => {
      clear();

      fn?.(params);
      apply();

      clear();
    },

    // subscribeApply: subscribeFactory(applyHandlers),

    onChange: <Value = unknown>(event: Change<Value>) => {
      if (!event.path) {
        return;
      }

      /**
       * if it's a single onChange not in mutations or commands we just call
       * the apply function on the next render.
       */
      if (!changes.length) {
        requestAnimationFrame(apply);
      }

      changes.push(event);
    },
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
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;

  const valueRef = useRef({ value: props.value });
  valueRef.current = { value: props.value };

  const controller = useMemo(
    () => createController(valueRef, onChangeRef),
    [],
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
    render: (element: ReactElement<PropsWithChange>) => {
      if (element.props.onChange) {
        return element;
      }

      return cloneElement(element, {
        onChange: controller.onChange,
      });
    },
    controller,
  }), [controller]);
};

export const useChanges = createUsePlugin<ChangesController>(changesToken);
