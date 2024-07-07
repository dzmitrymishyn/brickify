import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  type ForwardRefExoticComponent,
  useEffect,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import useMergedRefs from '../../Editor/useMergedRef';
import { useBeforeAfterRanges } from '../hooks/useBeforeAfterRanges';
import { useBrickState } from '../hooks/useBrickState';
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
    editable: initialEditable = false,
    ...props
  }) => {
    const state = useBrickState(initialEditable);
    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);
    const {
      ref: mutationsRef,
      subscribe: subscribeMutation,
      clear: clearMutations,
    } = useMutationsController({ rangesController, state, logger });

    // When the value is updated we need to clear our MutationsArray.
    // It will be performed after all the React's mutations in the DOM.
    useEffect(clearMutations, [props.value, clearMutations]);
    useEffect(function restoreRange() {
      pipe(rangesController.getAfter(), fromCustomRange, addRange);
    }, [rangesController, props.value]);

    const contextValue = useMemo(() => ({
      logger,
      ranges: rangesController,
      subscribeMutation,
      state: state.get,
    }), [
      logger,
      subscribeMutation,
      state,
      rangesController,
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
