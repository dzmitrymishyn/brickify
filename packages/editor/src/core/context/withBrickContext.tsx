import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  type ForwardRefExoticComponent,
  useEffect,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import useMergedRefs from '../../Editor/useMergedRef';
import { useChangesController } from '../changes';
import { useCommandsController } from '../commands/useCommandsController';
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

type Props = {
  logger?: Logger;
  editable?: boolean;
};

export function withBrickContext<P extends { value: object }>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext: React.FC<P & Props> = ({
    logger = EmptyLogger,
    editable = false,
    ...props
  }) => {
    const changesController = useChangesController();
    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);
    const {
      ref: mutationsRef,
      subscribe: subscribeMutation,
      clear: clearMutations,
    } = useMutationsController({
      rangesController,
      changesController,
      logger,
    });
    const {
      subscribe: subscribeCommand,
    } = useCommandsController({ changesController, rangesController });

    // When the value is updated we need to clear our MutationsArray.
    // It will be performed after all the React's mutations in the DOM.
    useEffect(clearMutations, [props.value, clearMutations, editable]);
    useEffect(function restoreRange() {
      pipe(rangesController.getAfter(), fromCustomRange, addRange);
    }, [rangesController, props.value]);

    const contextValue = useMemo(() => ({
      logger,
      ranges: rangesController,
      changes: changesController,
      subscribeMutation,
      subscribeCommand,
      editable,
    }), [
      logger,
      changesController,
      subscribeMutation,
      subscribeCommand,
      rangesController,
      editable,
    ]);

    const ref = useMergedRefs(
      rangesControllerRef,
      rangeSaverElementRef,
      mutationsRef,
      disalowKeyboardRef,
    );

    return (
      <BrickContext.Provider value={contextValue}>
        <Component ref={ref} {...props as P} />
      </BrickContext.Provider>
    );
  };

  WithBrickContext.displayName = (
    `WithBrickContext(${Component.displayName ?? 'Unnamed'})`
  );

  return WithBrickContext;
};
