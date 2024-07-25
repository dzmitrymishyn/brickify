import { match } from '@brickifyio/browser/hotkeys';
import {
  addRange,
  getRange,
  isElementWithinRange,
} from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/utils';
import { useCallback, useEffect, useRef } from 'react';

import {
  type Command,
  type RangeCallback,
  type ResultsCallback,
} from './models';
import { type ChangesController, type OnChange } from '../changes';
import { type BrickContextType } from '../context';
import { type BeforeAfterRangesController } from '../hooks';
import { type Cache } from '../hooks/useBrickCache';
import { type Logger } from '../logger';
import { type MutationsController } from '../mutations';
import assert from 'assert';

type UseCommandControllerOptions = {
  changesController: ChangesController;
  rangesController: BeforeAfterRangesController;
  mutationsController: MutationsController;
  logger?: Logger;
  cache: Cache;
};

export const useCommandsController = ({
  changesController,
  rangesController,
  mutationsController,
  cache,
  logger,
}: UseCommandControllerOptions) => {
  const ref = useRef<HTMLElement>(null);
  const subscribersRef = useRef(
    new Map<Node, () => {
      onChange?: OnChange;
      handlers: Command[];
    }>(),
  );

  const subscribe = useCallback<BrickContextType['subscribeCommand']>((
    element,
    getHandlers,
  ) => {
    subscribersRef.current.set(element, getHandlers);

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
    const handle = (originalEvent: KeyboardEvent) => {
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

      let current: Node | null = getFirstDeepLeaf(
        range?.startContainer ?? null,
      );
      let descendants: Node[] = [];

      while (range) {
        while (current) {
          if (subscribersRef.current.has(current)) {
            break;
          }

          current = current.parentNode;
        }

        if (!current) {
          break;
        }

        const { onChange, handlers } = subscribersRef.current.get(current)?.()
          ?? { handlers: [] };

        assert(Array.isArray(handlers), 'Commands should be array of Command');

        if (handlers.length) {
          const options = {
            originalEvent,
            target: current,
            descendants,

            results: getOrUpdateResults,
            range: getOrUpdateRange,
            cache: cache.get,

            onChange: onChange ?? (() => {
              throw new Error('You should specify onChange');
            }),
          };

          handlers.find((handler) => {
            if (typeof handler === 'function') {
              handler(options);
            } else if (
              handler.shortcuts
                ?.some((shortcut) => match(originalEvent, shortcut))
            ) {
              handler.handle?.(options);
            }

            return false;
          });
        }

        if (results.stop) {
          break;
        }

        const nextDeepSiblingLeaf = getFirstDeepLeaf(current.nextSibling);
        if (isElementWithinRange(range,nextDeepSiblingLeaf)) {
          current = nextDeepSiblingLeaf;
          descendants = [];
        } else {
          descendants.unshift(current);
          current = current.parentNode;
        }
      }

      if (range) {
        addRange(range);
      }

      const mutationsAfterCommands = mutationsController.clear() ?? [];

      mutationsController.handle(mutationsAfterCommands);
      changesController.applyBatch();
    };

    element.addEventListener('keydown', handle);

    return () => element.removeEventListener('keydown', handle);
  }, [changesController, rangesController, logger, mutationsController, cache]);

  return { subscribe, ref };
};
