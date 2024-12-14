import { match } from '@brickifyio/browser/hotkeys';
import {
  getRange,
  isElementWithinRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/utils';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { useEffect, useMemo, useRef } from 'react';

import { type ResultsCallback } from ".";
import { type Command } from './models';
import { useDisallowHotkeys } from './useDisallowHotkeys';
import { useChanges } from '../changes';
import { useMutationsController } from '../mutations';
import { useSelectionController } from '../selection';
import assert from 'assert';

const token = Symbol('CommandsPlugin');

const metaKeyDisallowList = [
  'enter',
  'shift+enter',
  [
    'z', // undo
    'b', // bold
    'i', // italic
    'u', // underline
  ].map((key) => [`ctrl+${key}`, `cmd+${key}`]),
].flat(2);

const createController = () => {
  const subscriptions = new Map<Node, Command[]>();

  const subscribe = (element: Node, commands: Command[]) => {
    subscriptions.set(element, [
      ...subscriptions.get(element) ?? [],
      ...commands,
    ]);

    return () => {
      const allCommands = subscriptions.get(element) ?? [];
      const restCommands = allCommands.filter(
        (command) => !commands.includes(command),
      );

      if (!restCommands.length) {
        subscriptions.delete(element);
      } else {
        subscriptions.set(element, restCommands);
      }
    };
  };

  return {
    subscribe,
    subscriptions,
  };
};

export type CommandsController = ReturnType<typeof createController>;

export const useCommandsPluginFactory: UsePluginFactory<
  object,
  CommandsController
> = (_, deps) => {
  const ref = useRef<HTMLElement>(null);
  const controller = useMemo(
    () => createController(),
    [],
  );
  const changesController = useChanges(deps.plugins);
  const selectionController = useSelectionController(deps.plugins);
  const mutationsController = useMutationsController(deps.plugins);

  useEffect(() => {
    assert(
      ref.current,
      `ref for ${token.toString()} should be attached to a node`,
    );

    const element = ref.current;
    const handle = (originalEvent: KeyboardEvent) => {
      const range: Range | null = getRange();

      if (!range) {
        return;
      }

      const results: Record<string, unknown> = {};
      const getOrUpdateResults: ResultsCallback = (nameOrOptions) => {
        if (typeof nameOrOptions === 'string') {
          return results[nameOrOptions];
        }

        if (typeof nameOrOptions === 'object') {
          Object.assign(results, nameOrOptions || {});
        }
      };

      mutationsController.clear();

      let current: Node | null = getFirstDeepLeaf(
        range?.startContainer ?? null,
      );
      let descendants: Node[] = [];

      while (current) {
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

        const commands = controller.subscriptions.get(current);

        if (commands?.length) {
          const options = {
            originalEvent,
            target: current,
            descendants,

            results: getOrUpdateResults,
            range,

            stopBrickPropagation: () => getOrUpdateResults({
              stopPropagation: true,
            }),
            stopImmediatePropagation: () => getOrUpdateResults({
              stopImmediatePropagation: true,
            }),
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

      const nextRange = toCustomRange(ref.current!)(range);

      mutationsController.handle(mutationsController.clear() ?? []);
      selectionController.storeRange(nextRange, 'applyOnRender');
      changesController.apply();
    };

    element.addEventListener('keydown', handle);
    return () => element.removeEventListener('keydown', handle);
  }, [
    changesController,
    selectionController,
    mutationsController,
    controller.subscriptions,
    deps.store,
  ]);

  useDisallowHotkeys(ref, metaKeyDisallowList);

  return {
    ref,
    token,
    controller,
  };
};

export const useCommandsController = createUsePlugin<CommandsController>(
  token,
);
