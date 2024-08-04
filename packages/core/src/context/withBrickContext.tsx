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
import { useChangesController } from './useChangesController';
import { useCommandsController } from './useCommandsController';
import { useDisallowHotkeys } from './useDisallowHotkeys';
import { useMutationsController } from './useMutationsController';
import { useOnChange } from './useOnChange';
import { useRangeSaver } from './useRangeSaver';
import {
  type PropsWithChange,
} from '../changes';
import { getName } from '../components';
import { extend, withBrickName, withDisplayName } from '../extensions';
import { useBrickContextUnsafe , useMergedRefs } from '../hooks';
import { fromPathRange } from '../ranges';
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
  onChange?: (value: unknown) => void;
  brick?: object;
};

export function withBrickContext<P extends { value: object } & PropsWithChange>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext = forwardRef<Node, Props & Omit<P, 'brick' | 'onChange'>>(({
    editable = false,
    onChange: onChangeProp,
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
          onChange={onChangeProp}
        />
      );
    }

    const store = useBrickStoreFactory();
    const rootTreeNode = useMemo(() => of({}), []);

    if (!store.get(props.value)) {
      rootTreeNode.value = { value: props.value };
      rootTreeNode.slots = {};
      store.set(props.value, {
        slotsTreeNode: rootTreeNode,
        pathRef: { current: () => [] },
        value: props.value,
      });
    }

    const onChange = useOnChange({
      onChange: onChangeProp,
      rootTreeNode,
    });
    const changesController = useChangesController(store, onChange);

    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);
    const mutationsController = useMutationsController({
      rangesController,
      changesController,
      store,
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
      const range = rangesController.getAfter();

      if (!range) {
        return;
      }

      if ('container' in range) {
        pipe(range, fromCustomRange, addRange);
      } else {
        pipe(fromPathRange(range, rootTreeNode, store), addRange);
      }

    }, [rangesController, props.value, store, rootTreeNode]);

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
      store,
      onChange: changesController.onChange,
    }), [
      changesController,
      commandsController.subscribe,
      editable,
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
          onChange={changesController.onChange}
        />
      </BrickContext.Provider>
    );
  });

  return extend(
    WithBrickContext,
    Component,
    withBrickName(getName(Component)),
    withDisplayName(`WithBrickContext(${getName(Component) ?? 'Unnamed'})`),
  );
};
