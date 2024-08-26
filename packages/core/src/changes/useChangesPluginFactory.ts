import { tap } from '@brickifyio/operators';
import { patch } from '@brickifyio/utils/object';
import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import {
  cloneElement,
  type ReactElement,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { type Change, type ChangeState, type PropsWithChange } from './models';
import { type BrickValue, type PropsWithBrick } from '../components';
import { type UsePluginFactory } from '../plugins';
import { subscribeFactory } from '../utils';

export const changesToken = Symbol('changes');

const createChangesPluginController = (
  valueRef: RefObject<BrickValue[]>,
  onChangeRef: RefObject<undefined | ((value: object) => void)>,
) => {
  let state: ChangeState = 'interaction';
  const applyHandlers = new Map<Node, () => void>();

  let changes: Change[] = [];
  let markedForChanges: Node[] = [];

  const apply = () => pipe(
    markedForChanges,
    A.reduce(new Set<Node>(), (handledNodes, node: Node) => {
      if (!handledNodes.has(node)) {
        handledNodes.add(node);
        applyHandlers.get(node)?.();
      }

      return handledNodes;
    }),
    () => O.fromNullable(onChangeRef.current),
    O.ap(pipe(
      changes.length ? patch(valueRef.current, changes) : null,
      O.fromNullable,
      // eslint-disable-next-line no-console -- TODO: Replace it with logger
      O.map(tap(console.log.bind(null, 'new value'))),
    )),
  );

  const clear = (newState: ChangeState) => {
    state = newState;
    changes = [];
    markedForChanges = [];
  };

  return {
    state: () => state,
    changes: () => changes,

    markForApply: (node?: Node) => {
      if (node) {
        markedForChanges.push(node);
      }
    },

    handle: <T>(
      fn?: (params: T) => void,
      newState: ChangeState = 'interaction',
    ) => (params: T) => {
      clear(newState);

      fn?.(params);
      apply();

      clear('interaction');
    },

    subscribeApply: subscribeFactory(applyHandlers),

    onChange: <Value = unknown>(event: Change<Value>) => {
      if (!event.path) {
        return;
      }

      if (!changes.length) {
        requestAnimationFrame(apply);
      }

      changes.push(event);
    },
  };
};

export type ChangesController = ReturnType<
  typeof createChangesPluginController
>;

type Props = {
  onChange?: (value: object) => void;
  value: BrickValue[];
};

export const useChangesPluginFactory: UsePluginFactory<Props, ChangesController> = (
  props,
) => {
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;

  const valueRef = useRef(props.value);
  valueRef.current = props.value;

  const controller = useMemo(
    () => createChangesPluginController(valueRef, onChangeRef),
    [],
  );

  return useMemo(() => ({
    token: changesToken,
    props: {
      onChange: controller.onChange,
    },
    render: (element: ReactElement<PropsWithBrick & PropsWithChange>) => {
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
