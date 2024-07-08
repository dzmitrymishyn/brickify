import { addRange, getRange, isElementWithinRange } from '@brickifyio/browser/selection';
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
import { type MutationsController } from '../mutations';
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

    const element = ref.current;
    const handle = (event: KeyboardEvent) => {
      let range = getRange();

      const results: Record<string, unknown> = {};

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
      mutationsController.clear();
      logger?.log('Command detection is started');

      let current: Node | null = range?.startContainer ?? null;

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

        const handleCommand = subscribersRef.current.get(current);

        if (handleCommand) {
          try {
            handleCommand({
              event,
              results: getOrUpdateResults,
              range: getOrUpdateRange,
              element: current,
            });
          } catch (error) {
            logger?.error('Cannot handle keyboard event', error);
          }
        }

        current = getFirstDeepLeaf(current.nextSibling)
          ?? current.parentNode;
      }

      if (range) {
        addRange(range);
      }

      if (mutationsController.handle(mutationsController.clear() ?? [])) {
        logger?.log('Commands were handled. Run apply fn for components');
      } else {
        logger?.log('There are no commands to handle');
      }
      changesController.applyBatch();
    };

    element.addEventListener('keydown', handle);

    return () => element.removeEventListener('keydown', handle);
  }, [changesController, rangesController, logger, mutationsController]);

  return { subscribe, ref };
};
