import {
  type ForwardRefExoticComponent,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import useMergedRefs from '../../Editor/useMergedRef';
import { type Change } from '../changes';
import { useBeforeAfterRanges } from '../hooks/useBeforeAfterRanges';
import { useChanges } from '../hooks/useChanges';
import { useRangeSaver } from '../hooks/useRangeSaver';
import { EmptyLogger, type Logger } from '../logger';
import { useMutationsController } from '../mutations';

type Props = {
  logger?: Logger;
};

export function withBrickContext<P>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext: React.FC<P & Props> = ({
    logger = EmptyLogger,
    ...props
  }) => {
    const changes = useChanges();
    const [rangesControllerRef, rangesController] = useBeforeAfterRanges();
    const rangeSaverElementRef = useRangeSaver(rangesController);
    const {
      ref: mutationsRef,
      subscribe: subscribeMutation,
      clear: clearMutations,
    } = useMutationsController(rangesController, changes);

    const contextValue = useMemo(() => ({
      logger,
      ranges: rangesController,
      subscribeMutation,
      clearMutations,
      trackChange(change: Change) {
        changes.add(change);
        return change;
      },
    }), [
      logger,
      subscribeMutation,
      clearMutations,
      changes,
      rangesController,
    ]);

    const ref = useMergedRefs(
      rangesControllerRef,
      rangeSaverElementRef,
      mutationsRef,
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
