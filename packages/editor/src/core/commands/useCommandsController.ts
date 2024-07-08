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
import { type Logger } from '../logger';
import { revertDomByMutations, type MutationsController } from '../mutations';
import assert from 'assert';

type UseCommandControllerOptions = {
  changesController: ChangesController;
  rangesController: BeforeAfterRangesController;
  mutationsController: MutationsController;
  logger?: Logger;
};

export const useCommandsController = ({
  changesController,
  rangesController,
  mutationsController,
  logger,
}: UseCommandControllerOptions) => {
  const ref = useRef<HTMLElement>(null);
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
    assert(
      ref.current,
      'useCommandsController: ref should be attached to a node',
    );

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
      logger?.log('Command detection is started');

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
          try {
            const hasNewDomChanges = handler({
              event,
              results: getOrUpdateResults,
              range: getOrUpdateRange,
              element: current,
            }) || false;

            hasDomChanges = hasDomChanges || hasNewDomChanges;
          } catch (error) {
            logger?.error('Cannot handle keyboard event', error);
          }
        }

        current = getFirstDeepLeaf(current.nextSibling)
          ?? current.parentNode;
      }

      if (hasDomChanges) {
        if (range) {
          rangesController.saveAfter(range);
        }
        logger?.log('Commands were handled. Run apply fn for components');
        revertDomByMutations(mutationsController.clear() ?? []);
        mutationsController.clear();
        changesController.applyBatch();
      } else {
        logger?.log('There are no commands to handle');
        changesController.endBatch();
      }
    };
    const element = ref.current;

    element.addEventListener('keydown', handle);
    return () => element.removeEventListener('keydown', handle);
  }, [changesController, rangesController, logger, mutationsController]);

  return { subscribe, ref };
};
