import { getRange, isElementWithinRange } from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/utils';
import { useCallback, useEffect, useRef } from 'react';

import {
  type HandleCommand,
  type RangeCallback,
  type ResultsCallback,
} from './models';
import { type ChangesController } from '../changes';
import { type BeforeAfterRangesController } from '../hooks';

type UseCommandControllerOptions = {
  changesController: ChangesController;
  rangesController: BeforeAfterRangesController;
};

export const useCommandsController = ({
  changesController,
  rangesController,
}: UseCommandControllerOptions) => {
  const subscribersRef = useRef(new Map<Node, HandleCommand>());

  const subscribe = useCallback((
    element: HTMLElement,
    execute: HandleCommand,
  ) => {
    subscribersRef.current.set(element, execute);

    return () => {
      subscribersRef.current.delete(element);
    };
  }, []);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      let range = getRange();
      const startContainer = range?.startContainer;

      if (!startContainer) {
        return;
      }

      let current: Node | null = startContainer;
      const results: Record<string, unknown> = {};
      let hasDomChanges = false;

      const getOrUpdateResults: ResultsCallback = (nameOrOptions) => {
        if (typeof nameOrOptions === 'string') {
          return results[nameOrOptions];
        }

        if (typeof nameOrOptions === 'object') {
          Object.assign(results, nameOrOptions || {});
        }
      };

      const getOrUpdateRange: RangeCallback = (newRange?: Range) => {
        if (newRange instanceof Range) {
          range = newRange;
        }
        return range;
      };

      changesController.startBatch();

      while (current && range && isElementWithinRange(current, range)) {
        while (current) {
          if (subscribersRef.current.has(current)) {
            break;
          }

          current = current.parentNode;
        }

        if (!current) {
          break;
        }

        const handler = subscribersRef.current.get(current);

        if (handler) {
          const hasNewDomChanges = handler({
            event,
            results: getOrUpdateResults,
            range: getOrUpdateRange,
            element: current,
          }) || false;

          hasDomChanges = hasDomChanges || hasNewDomChanges;
        }

        current = getFirstDeepLeaf(current.nextSibling)
          ?? current.parentNode;
      }

      if (hasDomChanges) {
        if (range) {
          rangesController.saveAfter(range);
        }

        changesController.applyBatch();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [changesController, rangesController]);

  return {
    subscribe,
  };
};
