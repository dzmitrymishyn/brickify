import {
  getRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import {
  createUsePlugin,
  type Plugin,
  type PluginDependencies,
} from '@brickifyio/renderer';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  type ComponentMutations,
  type ComponentMutationsHandler,
} from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { useBeforeMutationRangeSaver } from './useBeforeMutationRangeSaver';
import { useChangesPlugin } from '../changes';
import { useCommandsPlugin } from '../commands';
import { useSelectionPlugin } from '../selection';
import { makeResults } from '../utils';
import assert from 'assert';

const token = Symbol('MutationsPlugin');

export const useMutationsPluginFactory = (
  { value }: { value: object },
  deps: PluginDependencies,
) => {
  const changes = useChangesPlugin(deps.plugins);
  const commands = useCommandsPlugin(deps.plugins);
  const selection = useSelectionPlugin(deps.plugins);
  const ref = useRef<Element>(null);
  const observerRef = useRef<MutationObserver>(null);
  const renderingPhase = useRef(false);
  const mutationsToRevertRef = useRef(new Set<MutationRecord>());
  const subscriptionsRef = useRef(
    new Map<Node, ComponentMutationsHandler[]>(),
  );

  const markToRevert = (mutations: MutationRecord[]) => {
    mutations.forEach((record) => mutationsToRevertRef.current.add(record));
  };

  const clear = useCallback(() => {
    mutationsToRevertRef.current.clear();
    return observerRef.current?.takeRecords() ?? [];
  }, []);

  const handle = useCallback((mutations: MutationRecord[]) => {
    try {
      mutationsToRevertRef.current.clear();

      if (mutations.length) {
        commands.processPostponed('mutation');
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
            const hasSubscription = subscriptionsRef.current.has(node);

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
            const hasSubscription = subscriptionsRef.current.has(current);

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
              options.addedDescendants.push(
                ...Array.from(mutation.addedNodes),
              );

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
              subscriptionsRef.current.get(node)?.forEach((fn) => fn(options));
            } catch (error) {
              // TODO: Add logger
            }
          },
        );

        currentMutations = observerRef.current?.takeRecords();

        allMutations.push(...currentMutations ?? []);
      }

      if (mutationsToRevertRef.current.size) {
        const nextRange = toCustomRange(ref.current!)(range);

        revertDomByMutations(
          // We can optimize this if we move filtering inside the function
          allMutations.filter((mutation) => mutationsToRevertRef.current.has(
            mutation,
          )),
        );

        selection.apply();
        selection.storeRange(nextRange, 'applyOnRender');
      }
    } catch (error) {
      // TODO: Add logger
    } finally {
      clear();
    }
  }, [clear, commands, selection]);

  const subscribe = useCallback(
    (element: Node, mutate: ComponentMutationsHandler) => {
      subscriptionsRef.current.set(element, [
        mutate,
        ...subscriptionsRef.current.get(element) ?? [],
      ]);

      return () => {
        const allMutations = subscriptionsRef.current.get(element)?.filter(
          (currentMutate) => currentMutate !== mutate,
        ) ?? [];

        if (allMutations.length) {
          subscriptionsRef.current.set(element, allMutations);
        } else {
          subscriptionsRef.current.delete(element);
        }
      };
    },
    [],
  );

  useEffect(() => {
    assert(
      ref.current,
      'The ref passed to useMutationsPlugin must be attached to a valid '
        + 'DOM node. Ensure that the ref is properly assigned.',
    );

    const observer = new MutationObserver((mutation) => {
      if (renderingPhase.current) {
        return;
      }

      handle(mutation);
      changes.apply();
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
  }, [changes, handle]);

  useLayoutEffect(() => {
    renderingPhase.current = true;
  }, [value]);
  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      clear();
      renderingPhase.current = false;
    },
    [value, clear],
  );

  useBeforeMutationRangeSaver(ref, selection);

  return {
    token,
    root: { ref },
    handle,
    clear,
    subscribe,
    markToRevert,
  };
};

export type MutationsPlugin = Plugin<typeof useMutationsPluginFactory>;

export const useMutationsPlugin = createUsePlugin<MutationsPlugin>(token);
