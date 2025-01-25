import { match } from '@brickifyio/browser/hotkeys';
import {
  getRange,
  isElementWithinRange,
  restoreRange,
} from '@brickifyio/browser/selection';
import { getFirstDeepLeaf } from '@brickifyio/browser/traverse';
import {
  createUsePlugin,
  type Plugin,
  type PluginDependencies,
} from '@brickifyio/renderer';
import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import { useCallback, useEffect, useRef } from 'react';

import {
  type Command,
  type PostponedCommand,
  type PostponedCommandType,
} from './models';
import { useDisallowHotkeys } from './useDisallowHotkeys';
import { useChangesPlugin } from '../changes';
import { makeResults } from '../utils';
import assert from 'assert';

const token = Symbol('CommandsPlugin');

const metaKeyDisallowList = [
  // 'enter',
  // 'shift+enter',
  [
    'b', // bold
    'i', // italic
    'u', // underline
  ].map((key) => [`ctrl+${key}`, `cmd+${key}`]),
].flat(2);

export const useCommandsPluginFactory = (
  _: unknown,
  deps: PluginDependencies,
) => {
  const ref = useRef<HTMLElement>(null);
  const subscriptionsRef = useRef(new Map<Node, Command[]>());
  const commandsQueueRef = useRef<PostponedCommand[]>([]);

  const changes = useChangesPlugin(deps.plugins);

  useEffect(() => {
    const element = ref.current!;
    const handleKeydown = (event: Event) => {
      ['cmd + z', 'ctrl + z'].find((shortcut) => {
        if (match(event, shortcut)) {
          changes.undo();
          event.preventDefault();
          return true;
        }
        return false;
      });
    };

    element.addEventListener('keydown', handleKeydown);
    return () => element.removeEventListener('keydown', handleKeydown);
  }, [ref, changes]);

  useEffect(() => {
    const element = ref.current!;
    const handleKeydown = (event: Event) => {
      ['cmd + shift + z', 'ctrl + shift + z'].find((shortcut) => {
        if (match(event, shortcut)) {
          changes.redo();
          event.preventDefault();
          return true;
        }
        return false;
      });
    };

    element.addEventListener('keydown', handleKeydown);
    return () => element.removeEventListener('keydown', handleKeydown);
  }, [ref, changes]);

  useDisallowHotkeys(ref, metaKeyDisallowList);

  const postpone = useCallback((command: PostponedCommand) => {
    commandsQueueRef.current.push(command);
    return () => {
      commandsQueueRef.current = commandsQueueRef.current
        .filter((current) => current !== command);
    };
  }, []);;

  const processPostponed = useCallback((type: PostponedCommandType) => {
    commandsQueueRef.current = commandsQueueRef.current
      .filter(({ condition, context, action }) => {
        const conditionResult = condition?.(type) ?? true;

        if (conditionResult === 'ignore') {
          return false;
        }

        if (conditionResult) {
          action(context, type);
        }

        return !conditionResult;
      });
  }, []);

  const subscribe = useCallback((element: Node, commands: Command[]) => {
    subscriptionsRef.current.set(element, [
      ...subscriptionsRef.current.get(element) ?? [],
      ...commands,
    ]);

    return () => {
      const allCommands = subscriptionsRef.current.get(element) ?? [];
      const restCommands = allCommands.filter(
        (command) => !commands.includes(command),
      );

      // if there are no more commands for a node then we need to remove it
      // otherwise we should save other commands
      if (!restCommands.length) {
        subscriptionsRef.current.delete(element);
      } else {
        subscriptionsRef.current.set(element, restCommands);
      }
    };
  }, []);

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
      O.bind('results', () => O.some(makeResults({
        stopImmediatePropagation: false,
        stopPropagation: false,
      }))),
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

          const commands = subscriptionsRef.current.get(current);

          if (commands?.length) {
            const options = {
              originalEvent,
              target: current,
              descendants,

              results,
              range,
              postpone,

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

        return range;
      }),
      O.map(restoreRange),
    );

    element.addEventListener('keydown', handle);
    return () => element.removeEventListener('keydown', handle);
  }, [
    changes,
    postpone,
    processPostponed,
    deps.store,
  ]);

  return {
    root: { ref },
    token,
    postpone,
    processPostponed,
    subscribe,
  };
};

export type CommandsPlugin = Plugin<typeof useCommandsPluginFactory>;

export const useCommandsPlugin = createUsePlugin<CommandsPlugin>(token);
