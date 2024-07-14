// If we have inherited context it means that we don't need to apply the same
// rules for all the actions. Parent component already added it
/* eslint-disable react-hooks/rules-of-hooks -- it's justified */
import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  type ForwardRefExoticComponent,
  useEffect,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import { type PropsWithBrick } from '../../bricks';
import { useMergedRefs } from '../../utils';
import { type PropsWithChange, useChangesController } from '../changes';
import { useCommandsController } from '../commands/useCommandsController';
import { useBrickContextUnsafe } from '../hooks';
import { useBeforeAfterRanges } from '../hooks/useBeforeAfterRanges';
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

type Props = Partial<PropsWithBrick> & {
  logger?: Logger;
  editable?: boolean;
  onChange: (value: unknown) => void;
};

export function withBrickContext<P extends { value: object } & PropsWithChange>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext: React.FC<P & Props> = ({
    logger = EmptyLogger,
    editable = false,
    onChange,
    ...props
  }) => {
    const inheritedContext = useBrickContextUnsafe();
    const hasInheritedContext = Boolean(inheritedContext);

    if (hasInheritedContext) {
      return <Component
        {...props as P}
        onChange={onChange}
      />;
    }

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
      pathRef: props.brick?.pathRef || { current: () => ['children'] },
    }), [
      logger,
      changesController,
      mutationsController.subscribe,
      commandsController.subscribe,
      rangesController,
      editable,
      props.brick?.pathRef,
    ]);

    const ref = useMergedRefs(
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
  };

  WithBrickContext.displayName = (
    `WithBrickContext(${Component.displayName ?? 'Unnamed'})`
  );

  return WithBrickContext;
};
