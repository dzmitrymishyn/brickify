// If we have inherited context it means that we don't need to apply the same
// rules for all the actions. Parent component already added it
/* eslint-disable react-hooks/rules-of-hooks -- it's justified */
import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  type ForwardRefExoticComponent,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { BrickContext } from './BrickContext';
import { useMergedRefs } from '../../utils';
import { type PropsWithChange, useChangesController } from '../changes';
import { useCommandsController } from '../commands/useCommandsController';
import { getName } from '../components';
import { extend, withDisplayName } from '../extensions';
import { useBrickContextUnsafe } from '../hooks';
import { useBeforeAfterRanges } from '../hooks/useBeforeAfterRanges';
import { useBrickCache } from '../hooks/useBrickCache';
import { useDisallowHotkeys } from '../hooks/useDisallowHotkeys';
import { useRangeSaver } from '../hooks/useRangeSaver';
import { EmptyLogger, type Logger } from '../logger';
import { useMutationsController } from '../mutations';

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
  logger?: Logger;
  editable?: boolean;
  onChange: (value: unknown) => void;
};

export function withBrickContext<P extends { value: object } & PropsWithChange>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext = forwardRef<Node, Props & P>(({
    logger = EmptyLogger,
    editable = false,
    onChange,
    ...props
  }, refProp) => {
    const inheritedContext = useBrickContextUnsafe();
    const hasInheritedContext = Boolean(inheritedContext);
    const internalRef = useRef<Element>();

    if (hasInheritedContext) {
      const ref = useMergedRefs(refProp, internalRef);
      // return Component({
      //   ...props,
      // })
      return <Component
        {...props as P}
        ref={ref}
        onChange={onChange}
      />;
    }

    const cache = useBrickCache();
    const changesController = useChangesController({ logger });
    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);
    const mutationsController = useMutationsController({
      rangesController,
      changesController,
      logger,
    });
    const commandsController = useCommandsController({
      changesController,
      rangesController,
      logger,
      cache,
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
    }, [rangesController, props.value]);

    const contextValue = useMemo(() => ({
      logger,
      ranges: rangesController,
      changes: changesController,
      subscribeMutation: mutationsController.subscribe,
      subscribeCommand: commandsController.subscribe,
      editable,
      pathRef: cache.get(internalRef.current!)?.pathRef
        || { current: () => ['children'] },
      cache,
    }), [
      logger,
      changesController,
      mutationsController.subscribe,
      commandsController.subscribe,
      rangesController,
      editable,
      cache,
    ]);

    const ref = useMergedRefs(
      refProp,
      internalRef,
      rangesControllerRef,
      rangeSaverElementRef,
      mutationsController.ref,
      disalowKeyboardRef,
      commandsController.ref,
    );

    return (
      <BrickContext.Provider value={inheritedContext ?? contextValue}>
        <Component
          ref={ref}
          {...props as P}
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
    // withBrickName(getName(Component)),
    withDisplayName(`WithBrickContext(${getName(Component) ?? 'Unnamed'})`),
  );
};
