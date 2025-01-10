import {
  getRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import {
  type ComponentMutations,
  type ComponentMutationsHandler,
} from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { useBeforeMutationRangeSaver } from './useBeforeMutationRangeSaver';
import { useChanges } from '../changes';
import { type CommandsController, useCommandsController } from '../commands';
import {
  type SelectionController,
  useSelectionController,
} from '../selection';
import { makeResults } from '../utils';
import assert from 'assert';

const token = Symbol('MutationsPlugin');

export const createController = ({
  ref,
  selectionController,
  commandsController,
  observerRef,
}: {
  ref: RefObject<Element | null>;
  selectionController: SelectionController;
  commandsController: CommandsController;
  observerRef: RefObject<MutationObserver | null>;
}) => {
  const mutationsToRevert = new Set<MutationRecord>();
  const subscriptions = new Map<Node, ComponentMutationsHandler[]>();

  const markToRevert = (mutations: MutationRecord[]) => {
    mutations.forEach((record) => mutationsToRevert.add(record));
  };

  const clear = () => {
    mutationsToRevert.clear();
    return observerRef.current?.takeRecords() ?? [];
  };

  const handle = (mutations: MutationRecord[]) => {
    try {
      mutationsToRevert.clear();

      if (mutations.length) {
        commandsController.processPostponed('mutation');
      }

      const range = getRange();
      const defaultComponentMutation: Omit<ComponentMutations, 'domNode' | 'results'> = {
        removed: false,
        removedDescendants: [],
        addedDescendants: [],
        mutations: [],
        range,
      };
      const allMutations: MutationRecord[] = [...mutations, ...clear()];
      let currentMutations: MutationRecord[] | undefined = allMutations;

      while (currentMutations?.length) {
        const affectedSubscriptions = new Map<Node, ComponentMutations>();
        const removedNodesMutations = new Map<Node, ComponentMutations>();
        const mutationWithoutParent = new Map<Node, MutationRecord[]>();

        for (let i = currentMutations.length - 1; i >= 0; i -= 1) {
          const mutation = currentMutations[i];
          mutation.removedNodes.forEach((node) => {
            const hasSubscription = Boolean(subscriptions.get(node));

            if (hasSubscription) {
              const options = affectedSubscriptions.get(node)
                ?? {
                  ...defaultComponentMutation,
                  domNode: node,
                  results: makeResults(),
                };

              options.removed = true;
              options.mutations.push(mutation);

              affectedSubscriptions.set(node, options);
            }
          });

          let current: Node | null = mutation.target;

          while (current) {
            const hasSubscription = Boolean(subscriptions.get(current));

            if (hasSubscription) {
              const options = affectedSubscriptions.get(current)
                ?? {
                  ...defaultComponentMutation,
                  domNode: current,
                  results: makeResults(),
                };

              options.mutations.push(mutation);
              options.removedDescendants.push(
                ...Array.from(mutation.removedNodes),
              );
              options.addedDescendants.push(...Array.from(mutation.addedNodes));

              mutation.removedNodes.forEach((node) => {
                removedNodesMutations.set(node, options);
              });

              affectedSubscriptions.set(current, options);
              break;
            }

            if (!current.parentNode) {
              const storedNodeMutations = mutationWithoutParent.get(current)
                ?? [];
              storedNodeMutations.push(mutation);
              mutationWithoutParent.set(current, storedNodeMutations);
            }

            current = current.parentNode ?? null;
          }
        }

        mutationWithoutParent.forEach((mutation, node) => {
          removedNodesMutations.get(node)?.mutations.push(...mutation);
        });

        affectedSubscriptions.forEach(
          (options, node) => {
            try {
              subscriptions.get(node)?.forEach((fn) => fn(options));
            } catch (error) {
              // TODO: Add logger
            }
          },
        );

        currentMutations = observerRef.current?.takeRecords();

        allMutations.push(...currentMutations ?? []);
      }

      if (mutationsToRevert.size) {
        const nextRange = toCustomRange(ref.current!)(range);

        revertDomByMutations(
          // We can optimize this if we move filtering inside the function
          allMutations.filter((mutation) => mutationsToRevert.has(mutation)),
        );

        selectionController.apply();
        selectionController.storeRange(nextRange, 'applyOnRender');
      }
    } catch (error) {
      // TODO: Add logger
    } finally {
      clear();
    }
  };

  const subscribe = (element: Node, mutate: ComponentMutationsHandler) => {
    subscriptions.set(element, [
      mutate,
      ...subscriptions.get(element) ?? [],
    ]);

    return () => {
      const allMutations = subscriptions.get(element)?.filter(
        (currentMutate) => currentMutate !== mutate,
      ) ?? [];

      if (allMutations.length) {
        subscriptions.set(element, allMutations);
      } else {
        subscriptions.delete(element);
      }
    };
  };

  return { handle, clear, subscribe, markToRevert };
};

export type MutationsController = ReturnType<typeof createController>;

export const useMutationsPluginFactory: UsePluginFactory<
  { value: unknown },
  MutationsController
> = ({ value }, deps) => {
  const changesController = useChanges(deps.plugins);
  const commandsController = useCommandsController(deps.plugins);
  const selectionController = useSelectionController(deps.plugins);
  const ref = useRef<Element>(null);
  const observerRef = useRef<MutationObserver>(null);

  const controller = useMemo(() => createController({
    ref,
    selectionController,
    commandsController,
    observerRef,
  }), [selectionController, commandsController]);

  const renderingPhase = useRef(false);

  useEffect(() => {
    assert(
      ref.current,
      'The ref passed to useMutationsController must be attached to a valid '
        + 'DOM node. Ensure that the ref is properly assigned.',
    );

    const observer = new MutationObserver((mutation) => {
      if (renderingPhase.current) {
        return;
      }

      controller.handle(mutation);
      changesController.apply();
    });

    observer.observe(ref.current, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      childList: true,
      characterData: true,
      characterDataOldValue: true,
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [controller, changesController]);

  useLayoutEffect(() => {
    renderingPhase.current = true;
  }, [value]);
  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      controller.clear();
      renderingPhase.current = false;
    },
    [value, controller],
  );

  useBeforeMutationRangeSaver(ref, selectionController);

  return {
    token,
    controller,
    ref,
  };
};

export const useMutationsController = createUsePlugin<MutationsController>(
  token,
);
