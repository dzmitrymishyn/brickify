import { match } from '@brickifyio/browser/hotkeys';
import {
  getRange,
  isElementWithinRange,
} from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/utils';
import { useEffect, useMemo, useRef } from 'react';

import { type RangeCallback, type ResultsCallback } from ".";
import { type Command } from './models';
import { useChanges } from '../changes';
import { useMutations } from '../mutations';
import { createUsePlugin, type UsePluginFactory } from '../plugins';
import { type PathRange, useBeforeAfterRanges } from '../ranges';
import { type BrickStore } from '../store';
import { type ElementSubscribe } from '../utils';
import assert from 'assert';

const token = Symbol('CommandsPlugin');

const createController = ({
  store,
}: {
  store: BrickStore;
}) => {
  const subscribe: ElementSubscribe<Command[]> = (element, commands) => {
    const storedItem = store.get(element);

    assert(storedItem, 'Store element should be defined');

    storedItem.commands = commands;

    return () => {
      storedItem.commands = [];
    };
  };

  return { subscribe };
};

export type CommandsController = ReturnType<typeof createController>;

export const useCommandsPluginFactory: UsePluginFactory<object, CommandsController> = (_, deps) => {
  const ref = useRef<HTMLElement>(null);
  const changesController = useChanges(deps.plugins);
  const rangesController = useBeforeAfterRanges(deps.plugins);
  const mutationsController = useMutations(deps.plugins)!;

  useEffect(() => {
    if (!changesController || !rangesController) {
      return;
    }

    assert(
      ref.current,
      'useCommandsController: ref should be attached to a node',
    );

    const element = ref.current;
    const handle = changesController.handle((originalEvent: KeyboardEvent) => {
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

      mutationsController.clear();

      let current: Node | null = getFirstDeepLeaf(
        range?.startContainer ?? null,
      );
      let descendants: Node[] = [];

      while (range) {
        // For the current brick it should be not set since we're going through
        // all the siblings
        getOrUpdateResults({ stopImmediatePropagation: undefined });

        while (current) {
          if (deps.store.get(current)) {
            break;
          }

          current = current.parentNode;
        }

        if (!current) {
          break;
        }

        const { commands, domNode, onChange } = deps.store.get(current)!;

        if (commands?.length) {
          changesController.markForApply(domNode);

          const options = {
            originalEvent,
            target: current,
            descendants,

            results: getOrUpdateResults,
            resultRange: setResultRange,
            range: getOrUpdateRange,
            getFromStore: deps.store.get,

            stopBrickPropagation: () => getOrUpdateResults({
              stopPropagation: true,
            }),
            stopImmediatePropagation: () => getOrUpdateResults({
              stopImmediatePropagation: true,
            }),

            onChange: onChange ?? changesController.onChange,
          };

          commands.find((handler) => {
            if (typeof handler === 'function') {
              handler(options);
            } else if (
              handler.shortcuts
                ?.some((shortcut) => match(originalEvent, shortcut))
            ) {
              handler.handle?.(options);
            }

            return getOrUpdateResults('stopImmediatePropagation');
          });
        }

        const nextDeepSiblingLeaf = getFirstDeepLeaf(current.nextSibling);
        if (isElementWithinRange(range, nextDeepSiblingLeaf)) {
          current = nextDeepSiblingLeaf;
          descendants = [];
        } else {
          descendants.unshift(current);
          current = getOrUpdateResults('stopPropagation')
            ? null
            : current.parentNode;
        }
      }

      const mutationsAfterCommands = mutationsController.clear() ?? [];

      if (resultRange) {
        rangesController.saveAfter(resultRange ?? null);
      }
      const nextRange = rangesController.getAfter();

      mutationsController.handle(mutationsAfterCommands);

      if (resultRange) {
        rangesController.saveAfter(nextRange);
      }
    }, 'batch');

    element.addEventListener('keydown', handle);
    return () => element.removeEventListener('keydown', handle);
  }, [
    changesController,
    rangesController,
    mutationsController,
    deps.store,
  ]);

  const controller = useMemo(
    () => createController({ store: deps.store }),
    [deps.store],
  );

  return {
    ref,
    token,
    controller,
  };
};

export const useCommandsController = createUsePlugin<CommandsController>(token);
