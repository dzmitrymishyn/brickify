import { addRange, fromRangeCopy } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { type RefObject, useEffect, useMemo, useRef } from 'react';

import { type Mutation, type MutationHandler } from './mutations';
import { revertDomByMutations } from './revertDomByMutations';
import { type ChangesController, useChanges } from '../changes';
import { createUsePlugin, type UsePluginFactory } from '../plugins';
import {
  type BeforeAfterRangesController,
  useBeforeAfterRanges,
} from '../ranges';
import { type BrickStore } from '../store';
import assert from 'assert';

const token = Symbol('MutationsPlugin');

export const createController = ({
  store,
  rangesController,
  changesController,
  observerRef,
}: {
  store: BrickStore;
  rangesController: BeforeAfterRangesController;
  changesController: ChangesController;
  observerRef: RefObject<MutationObserver | undefined>;
}) => {
  const handle = (mutations: MutationRecord[]) => {
    try {
      const defaultOptions: Omit<Mutation, 'target'> = {
        remove: false,
        removedNodes: [],
        addedNodes: [],
      };
      const handleOptions = new Map<Node, Mutation>();

      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          const storedElement = store.get(node);
          if (storedElement) {
            const options = handleOptions.get(node)
              ?? { ...defaultOptions, target: node };
            options.remove = true;
            handleOptions.set(node, options);
          }
        });

        let current: Node | null = mutation.target;

        while (current) {
          const storedElement = store.get(current);
          if (storedElement) {
            const options = handleOptions.get(current)
              ?? { ...defaultOptions, target: current };

            options.removedNodes.push(
              ...Array.from(mutation.removedNodes),
            );
            options.addedNodes.push(...Array.from(mutation.addedNodes));

            handleOptions.set(current, options);
          }

          current = current.parentNode ?? null;
        }
      });

      handleOptions.forEach(
        (options, node) => {
          try {
            changesController.markForApply(options.target);
            store.get(node)?.mutate?.(options);
          } catch (error) {
            // TODO: Add logger
          }
        },
      );

      if (changesController.changes().length) {
        rangesController.saveAfter();
        revertDomByMutations(mutations);
        pipe(
          rangesController.getBefore(),
          fromRangeCopy,
          addRange,
          () => rangesController.clearBefore(),
        );
        observerRef.current?.takeRecords();
      }
    } catch (error) {
      // TODO: Add logger
    }
  };

  const subscribe = (element: HTMLElement, mutate: MutationHandler) => {
    store.update(element, { mutate });

    return () => {
      store.update(element, { mutate: undefined });
    };
  };

  const clear = () => {
    return observerRef.current?.takeRecords();
  };

  return { handle, clear, subscribe };
};

export type MutationsController = ReturnType<typeof createController>;

export const useMutationsPluginFactory: UsePluginFactory<
  MutationsController
> = (_, deps) => {
  const ref = useRef<Element>(null);
  const rangesController = useBeforeAfterRanges(deps.plugins);
  const changesController = useChanges(deps.plugins);
  const observerRef = useRef<MutationObserver>();

  const controller = useMemo(() => createController({
    rangesController,
    changesController,
    store: deps.store,
    observerRef,
  }), [
    rangesController,
    changesController,
    deps.store,
  ]);

  useEffect(() => {
    assert(
      ref.current,
      'ref for useMutationsController should be attached to a node',
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
  }, [changesController, controller]);

  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      controller.clear();
    },
    [deps.brick.value, controller]
  );

  return {
    token,
    controller,
    ref,
  };
};

export const useMutations = createUsePlugin<MutationsController>(token);
