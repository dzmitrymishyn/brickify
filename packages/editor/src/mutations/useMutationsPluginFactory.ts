import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { type RefObject, useEffect, useMemo, useRef } from 'react';

import { type ComponentMutations, type ComponentMutationsHandler } from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import assert from 'assert';

const token = Symbol('MutationsPlugin');

export const createController = ({
  // rangesController,
  // changesController,
  observerRef,
}: {
  // rangesController: BeforeAfterRangesController;
  // changesController: ChangesController;
  observerRef: RefObject<MutationObserver | null>;
}) => {
  const mutationsToRevert = new Set<MutationRecord>();
  const subscriptions = new Map<Node, ComponentMutationsHandler>();

  const markToRevert = (mutations: MutationRecord[]) => {
    mutations.forEach((record) => mutationsToRevert.add(record));
  };

  const clear = () => {
    mutationsToRevert.clear();
    return observerRef.current?.takeRecords();
  };

  const handle = (mutations: MutationRecord[]) => {
    try {
      mutationsToRevert.clear();
      const defaultComponentMutation: Omit<ComponentMutations, 'domNode'> = {
        removed: false,
        removedDescendants: [],
        addedDescendants: [],
        mutations: [],
      };

      const affectedSubscriptions = new Map<Node, ComponentMutations>();
      const removedNodesMutations = new Map<Node, ComponentMutations>();
      const mutationWithoutParent = new Map<Node, MutationRecord[]>();

      mutations.reduceRight<void>((_, mutation) => {
        mutation.removedNodes.forEach((node) => {
          const hasSubscription = Boolean(subscriptions.get(node));

          if (hasSubscription) {
            const options = affectedSubscriptions.get(node)
              ?? { ...defaultComponentMutation, domNode: node };

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
              ?? { ...defaultComponentMutation, domNode: current };

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

        return undefined;
      }, undefined);

      mutationWithoutParent.forEach((mutation, node) => {
        removedNodesMutations.get(node)?.mutations.push(...mutation);
      });

      affectedSubscriptions.forEach(
        (options, node) => {
          try {
            // changesController.markForApply(options.target);
            subscriptions.get(node)?.(options);
          } catch (error) {
            // TODO: Add logger
          }
        },
      );

      if (mutationsToRevert.size) {
        // rangesController.saveAfter();
        revertDomByMutations(
          // We can optimize this if we move filtering inside the function
          mutations.filter((mutation) => mutationsToRevert.has(mutation)),
        );
        // pipe(
        //   rangesController.getBefore(),
        //   fromRangeLike,
        //   addRange,
        //   () => rangesController.clearBefore(),
        // );
      }
    } catch (error) {
      // TODO: Add logger
    } finally {
      clear();
    }
  };

  const subscribe = (element: Node, mutate: ComponentMutationsHandler) => {
    subscriptions.set(element, mutate);

    return () => {
      subscriptions.delete(element);
    };
  };

  return { handle, clear, subscribe, markToRevert };
};

export type MutationsController = ReturnType<typeof createController>;

export const useMutationsPluginFactory: UsePluginFactory<
  object,
  MutationsController
> = (_, deps) => {
  const ref = useRef<Element>(null);
  // const rangesController = useBeforeAfterRanges(deps.plugins);
  // const changesController = useChanges(deps.plugins);
  const observerRef = useRef<MutationObserver>(null);

  const controller = useMemo(() => createController({
    // rangesController,
    // changesController,
    observerRef,
  }), [
    // rangesController,
    // changesController,
  ]);

  useEffect(() => {
    assert(
      ref.current,
      'The ref passed to useMutationsController must be attached to a valid '
        + 'DOM node. Ensure that the ref is properly assigned.',
    );

    const observer = new MutationObserver(
      controller.handle,
      // changesController.handle(controller.handle),
    );

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
  }, [controller]);

  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      controller.clear();
    },
    [deps.stored.value, controller]
  );

  return {
    token,
    controller,
    ref,
  };
};

export const useMutationsController = createUsePlugin<MutationsController>(
  token,
);
