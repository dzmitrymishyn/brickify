// If we have inherited context it means that we don't need to apply the same
// rules for all the actions. Parent component already added it
/* eslint-disable react-hooks/rules-of-hooks -- it's justified */
import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { of } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  type ForwardRefExoticComponent,
  useEffect,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import { useBeforeAfterRanges } from './useBeforeAfterRanges';
import { useBrickStoreFactory } from './useBrickStoreFactory';
import { useDisallowHotkeys } from './useDisallowHotkeys';
import { useRangeSaver } from './useRangeSaver';
import { type PropsWithChange, useChangesController } from '../changes';
import { useCommandsController } from '../commands/useCommandsController';
import { getName } from '../components';
import { extend, withDisplayName } from '../extensions';
import { useBrickContextUnsafe } from '../hooks';
import { useMutationsController } from '../mutations';
import { useMergedRefs } from '../utils';
import assert from 'assert';

const metaKeyDisallowList = [
  'enter',
  'shift+enter',
  ...[
    'z', // undo
    'b', // bold
    'i', // italic
    'u', // underline
  ].map((key) => [`ctrl+${key}`, `cmd+${key}`]),
].flat();

type Props = {
  editable?: boolean;
  onChange: (value: unknown) => void;
  brick?: object;
};

export function withBrickContext<P extends { value: object } & PropsWithChange>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext = forwardRef<Node, Props & Omit<P, 'brick'>>(({
    editable = false,
    onChange,
    brick,
    ...props
  }, refProp) => {
    const inheritedContext = useBrickContextUnsafe();

    if (inheritedContext) {
      assert(brick, 'brick value should be passed from the parent component');
      return (
        <Component
          {...props as P}
          brick={brick}
          onChange={onChange}
        />
      );
    }

    const store = useBrickStoreFactory();
    const rootTreeNode = useMemo(() => of({}), []);

    if (!store.get(props.value)) {
      rootTreeNode.value = { value: props.value };
      store.set(props.value, {
        slotsTreeNode: rootTreeNode,
        pathRef: { current: () => [] },
        value: props.value,
      });
    }

    const changesController = useChangesController();
    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);
    const mutationsController = useMutationsController({
      rangesController,
      changesController,
    });
    const commandsController = useCommandsController({
      changesController,
      rangesController,
      store,
      mutationsController,
    });

    // When the value is updated we need to clear our MutationsArray.
    // It will be performed after all the React's mutations in the DOM.
    useEffect(
      () => {
        mutationsController.clear();
      },
      [props.value, mutationsController, editable]
    );

    useEffect(function restoreRange() {
      pipe(rangesController.getAfter(), fromCustomRange, addRange);
    }, [rangesController, props.value, store]);

    const ref = useMergedRefs(
      refProp,
      rangesControllerRef,
      rangeSaverElementRef,
      mutationsController.ref,
      disalowKeyboardRef,
      commandsController.ref,
    );

    const contextValue = useMemo(() => ({
      ranges: rangesController,
      changes: changesController,
      subscribeMutation: mutationsController.subscribe,
      subscribeCommand: commandsController.subscribe,
      editable,
      rootTreeNode,
      store,
    }), [
      changesController,
      commandsController.subscribe,
      editable,
      rootTreeNode,
      mutationsController.subscribe,
      rangesController,
      store,
    ]);

    return (
      <BrickContext.Provider value={contextValue}>
        <Component
          ref={ref}
          {...props as P}
          brick={props.value}
          onChange={(change) => {
            // It should be impossible that the wrapped component will emit
            // multiple changes or it's own removals
            // TODO: Check it
            if (change.type === 'update') {
              onChange?.(change.value);
            }
          }}
        />
      </BrickContext.Provider>
    );
  });

  WithBrickContext.displayName = `WithBrickContext(${getName(Component) ?? 'Unnamed'})`;

  return extend(
    WithBrickContext,
    Component,
    withDisplayName(`WithBrickContext(${getName(Component) ?? 'Unnamed'})`),
  );
};
