import {
  addRange,
  fromRangeCopy,
  getRange,
  type RangeCopy,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { pipe } from 'fp-ts/lib/function';
import { type RefObject, useEffect, useMemo, useRef } from 'react';

import {
  type ComponentMutations,
  type ComponentMutationsHandler,
} from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { useBeforeMutationRangeSaver } from './useBeforeMutationRangeSaver';
import { useChanges } from '../changes';
import {
  AFTER_CHANGE,
  type RangesController,
  useRangesController,
} from '../ranges';
import assert from 'assert';

const token = Symbol('MutationsPlugin');

export const createController = ({
  ref,
  rangesController,
  observerRef,
}: {
  ref: RefObject<Element>;
  rangesController: RangesController;
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
        rangesController.set(AFTER_CHANGE, toCustomRange(ref.current)(getRange()));
        revertDomByMutations(
          // We can optimize this if we move filtering inside the function
          mutations.filter((mutation) => mutationsToRevert.has(mutation)),
        );
        pipe(
          rangesController.get('beforeMutation') as RangeCopy,
          fromRangeCopy,
          addRange,
          () => rangesController.delete('beforeMutation'),
        );
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
  { value: unknown },
  MutationsController
> = ({ value }, deps) => {
  const changesController = useChanges(deps.plugins);
  const ref = useRef<Element>(null);
  const rangesController = useRangesController(deps.plugins);
  const observerRef = useRef<MutationObserver>(null);

  const controller = useMemo(() => createController({
    ref,
    rangesController,
    observerRef,
  }), [rangesController]);

  useEffect(() => {
    assert(
      ref.current,
      'The ref passed to useMutationsController must be attached to a valid '
        + 'DOM node. Ensure that the ref is properly assigned.',
    );

    const observer = new MutationObserver(
      changesController.handle(controller.handle),
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
  }, [controller, changesController]);

  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      controller.clear();
    },
    [value, controller],
  );

  useBeforeMutationRangeSaver(ref, rangesController);

  return {
    token,
    controller,
    ref,
  };
};

export const useMutationsController = createUsePlugin<MutationsController>(
  token,
);
