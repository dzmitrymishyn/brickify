import { match } from '@brickifyio/browser/hotkeys';
import {
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
import { type BeforeAfterRangesController } from '../context/useBeforeAfterRanges';
import { type MutationsController } from '../mutations';
import { type PathRange } from '../ranges';
import { type BrickStore } from '../store';
import assert from 'assert';

type UseCommandControllerOptions = {
  changesController: ChangesController;
  rangesController: BeforeAfterRangesController;
  mutationsController: MutationsController;
  store: BrickStore;
  onChange: OnChange;
};

export const useCommandsController = ({
  changesController,
  rangesController,
  mutationsController,
  store,
  onChange,
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
      let range: Range | null = getRange();
      let resultRange: PathRange | Range | undefined;

      const results: Record<string, unknown> = {};
      const getOrUpdateResults: ResultsCallback = (nameOrOptions) => {
        if (typeof nameOrOptions === 'string') {
          return results[nameOrOptions];
        }

        if (typeof nameOrOptions === 'object') {
          Object.assign(results, nameOrOptions || {});
        }
      };
      const setResultRange = (newRange?: Range | PathRange) => {
        resultRange = newRange;
      };
      const getOrUpdateRange: RangeCallback = (newRange) => {
        if (newRange) {
          range = newRange;
        }
        return range instanceof Range ? range : null;
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

        const { onChange: currentOnChange, handlers } =
          subscribersRef.current.get(current)?.() ?? { handlers: [] };

        assert(Array.isArray(handlers), 'Commands should be array of Command');

        if (handlers.length) {
          const options = {
            originalEvent,
            target: current,
            descendants,

            results: getOrUpdateResults,
            resultRange: setResultRange,
            range: getOrUpdateRange,
            getFromStore: store.get,
            onChange: currentOnChange ?? onChange,
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
        if (isElementWithinRange(range, nextDeepSiblingLeaf)) {
          current = nextDeepSiblingLeaf;
          descendants = [];
        } else {
          descendants.unshift(current);
          current = current.parentNode;
        }
      }

      const mutationsAfterCommands = mutationsController.clear() ?? [];

      rangesController.saveAfter(resultRange ?? null);
      const nextRange = rangesController.getAfter();

      mutationsController.handle(mutationsAfterCommands);
      changesController.applyBatch();

      rangesController.saveAfter(nextRange);
    };

    element.addEventListener('keydown', handle);
    return () => element.removeEventListener('keydown', handle);
  }, [
    changesController,
    rangesController,
    mutationsController,
    store,
    onChange,
  ]);

  return { subscribe, ref };
};
