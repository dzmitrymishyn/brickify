import { match } from '@brickifyio/browser/hotkeys';
import {
  getRange,
  isElementWithinRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/utils';
import { tap } from '@brickifyio/operators';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
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
  // 'enter',
  // 'shift+enter',
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

      // if there are no more commands for a node then we need to remove it
      // otherwise we should save other commands
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
  const controller = useMemo(() => createController(), []);

  const changesController = useChanges(deps.plugins);
  const selectionController = useSelectionController(deps.plugins);
  const mutationsController = useMutationsController(deps.plugins);

  useEffect(() => {
    assert(
      ref.current,
      `ref for ${token.toString()} should be attached to a node`,
    );

    const element = ref.current;

    const handle = flow(
      O.of<KeyboardEvent>,
      O.bindTo('originalEvent'),
      O.bind('range', flow(getRange, O.fromNullable)),
      O.bind('results', () => {
        const results: Record<string, unknown> = {};

        return O.of<ResultsCallback>((nameOrOptions: unknown) => {
          if (typeof nameOrOptions === 'string') {
            return results[nameOrOptions];
          }

          if (typeof nameOrOptions === 'object') {
            Object.assign(results, nameOrOptions || {});
          }
        });
      }),
      O.map(tap(mutationsController.clear)),
      O.map(({ range, originalEvent, results }) => {
        let current: Node | null = getFirstDeepLeaf(
          range?.startContainer ?? null,
        );
        let descendants: Node[] = [];

        while (current) {
          // For the current node it should be not set since we're going
          // through all the siblings
          results({ stopImmediatePropagation: undefined });

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

              results,
              range,

              stopBrickPropagation: () => results({
                stopPropagation: true,
              }),
              stopImmediatePropagation: () => results({
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

              return results('stopImmediatePropagation');
            });
          }

          const nextDeepSiblingLeaf = getFirstDeepLeaf(current.nextSibling);
          if (isElementWithinRange(range, nextDeepSiblingLeaf)) {
            current = nextDeepSiblingLeaf;
            descendants = [];
          } else {
            descendants.unshift(current);
            current = results('stopPropagation')
              ? null
              : current.parentNode;
          }
        }

        return toCustomRange(ref.current!)(range);
      }),
      O.map(tap(() => mutationsController.handle(
        mutationsController.clear() ?? [],
      ))),
      O.map((range) => selectionController.storeRange(range, 'applyOnRender')),
      O.map(changesController.apply),
    );

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
