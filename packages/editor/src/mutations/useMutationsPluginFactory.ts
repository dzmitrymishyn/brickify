import {
  getRange,
  toCustomRange,
} from '@brickifyio/browser/selection';
import {
  createUsePlugin,
  type Plugin,
  type PluginDependencies,
} from '@brickifyio/renderer';
import { useBeforeRender } from '@brickifyio/utils/hooks';
import {
  useCallback,
  useEffect,
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

export type MutationPhase = 'capture' | 'bubble';

type SubscriptionsMap = Record<
  MutationPhase,
  Map<Node, ComponentMutationsHandler[]>
>;

export const useMutationsPluginFactory = (
  { value }: { value: object },
  deps: PluginDependencies,
) => {
  const changes = useChangesPlugin(deps.plugins);
  const commands = useCommandsPlugin(deps.plugins);
  const selection = useSelectionPlugin(deps.plugins);
  const ref = useRef<HTMLElement>(null);
  const observerRef = useRef<MutationObserver>(null);
  const phasesRef = useRef(new Set<'rendering' | 'composition'>());
  const preventedMutationsRef = useRef(new Set<MutationRecord>());
  const subscriptionsRef = useRef<SubscriptionsMap>({
    capture: new Map(),
    bubble: new Map(),
  });

  const preventMutationRevert = (mutations: MutationRecord[]) => {
    mutations.forEach((record) => preventedMutationsRef.current.add(record));
  };

  const clear = useCallback(() => {
    preventedMutationsRef.current.clear();
    return observerRef.current?.takeRecords() ?? [];
  }, []);

  const handle = useCallback((mutations: MutationRecord[]) => {
    clear();

    if (mutations.length) {
      commands.processPostponed('mutation');
    }

    const range = getRange();

    const affectedSubscriptions = new Map<Node, ComponentMutations>();
    const newMutations: MutationRecord[] = [];

    const makeDefaultOptions = (node: Node): ComponentMutations => ({
      removed: false,
      removedDescendants: [],
      addedDescendants: [],
      mutations: [],
      range,
      domNode: node,
      results: makeResults(),
    });
    const trackAffectedSubscriptions = (mutation: MutationRecord) => {
      mutation.removedNodes.forEach((node) => {
        const hasSubscription = subscriptionsRef.current.capture.has(node)
          || subscriptionsRef.current.bubble.has(node);

        if (hasSubscription) {
          const options = affectedSubscriptions.get(node)
            ?? makeDefaultOptions(node);

          options.removed = true;
          options.mutations.push(mutation);

          affectedSubscriptions.set(node, options);
        }
      });

      let current: Node | null = mutation.target;

      while (current) {
        const hasSubscription = subscriptionsRef.current.capture.has(current)
          || subscriptionsRef.current.bubble.has(current);

        if (hasSubscription) {
          const options = affectedSubscriptions.get(current)
            ?? makeDefaultOptions(current);

          options.mutations.push(mutation);
          options.removedDescendants.push(
            ...Array.from(mutation.removedNodes),
          );
          options.addedDescendants.push(
            ...Array.from(mutation.addedNodes),
          );

          affectedSubscriptions.set(current, options);
          break;
        }

        current = current.parentNode ?? null;
      }
    };
    const traverseAffectedSubscriptions = (
      map: Map<Node, ComponentMutationsHandler[]>,
      inverse = false,
    ) => {
      affectedSubscriptions.forEach(
        (options, node) => {
          const operation = inverse ? 'reduceRight' : 'reduce';
          map.get(node)?.[operation]((_, fn) => {
            try {
              fn(options);
            } catch (error) {
              // TODO: Add logger
            }

            const currentMutations = observerRef.current?.takeRecords() ?? [];
            newMutations.push(...currentMutations);
            currentMutations.forEach(trackAffectedSubscriptions);

            return null;
          }, null);
        },
      );

    };

    for (let i = mutations.length - 1; i >= 0; i -= 1) {
      trackAffectedSubscriptions(mutations[i]);
    }

    traverseAffectedSubscriptions(subscriptionsRef.current.capture);
    traverseAffectedSubscriptions(subscriptionsRef.current.bubble, true);

    const allMutations = [...mutations, ...newMutations];

    if (preventedMutationsRef.current.size !== allMutations.length) {
      const nextRange = toCustomRange(ref.current!)(range);

      revertDomByMutations(
        // We can optimize this if we move filtering inside the function
        [...mutations, ...newMutations].filter(
          (mutation) => !preventedMutationsRef.current.has(mutation),
        ),
      );

      selection.apply('beforeMutation');
      selection.storeRange(nextRange, 'afterMutation');
    }

    clear();
  }, [clear, commands, selection]);

  const subscribe = useCallback(
    (
      element: Node,
      mutate: ComponentMutationsHandler,
      phase: MutationPhase = 'bubble',
    ) => {
      subscriptionsRef.current[phase].set(element, [
        mutate,
        ...subscriptionsRef.current[phase].get(element) ?? [],
      ]);

      return () => {
        const allMutations = subscriptionsRef.current[phase].get(element)?.filter(
          (currentMutate) => currentMutate !== mutate,
        ) ?? [];

        if (allMutations.length) {
          subscriptionsRef.current[phase].set(element, allMutations);
        } else {
          subscriptionsRef.current[phase].delete(element);
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

    let lastMutations: MutationRecord[] = [];
    const abortSignal = new AbortController();

    ref.current.addEventListener('compositionstart', () => {
      phasesRef.current.add('composition');
    }, { signal: abortSignal.signal });

    ref.current.addEventListener('compositionend', () => {
      phasesRef.current.delete('composition');
      handle(lastMutations);
      changes.apply();
    }, { signal: abortSignal.signal });

    const observer = new MutationObserver((mutations) => {
      lastMutations = mutations;

      if (phasesRef.current.size !== 0) {
        return;
      }

      handle(mutations);
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

    return () => {
      observer.disconnect();
      abortSignal.abort();
    };
  }, [changes, handle]);

  useBeforeRender(() => {
    phasesRef.current.add('rendering');
  }, [value]);
  // When the value is updated we need to clear our MutationsArray.
  // It will be performed after all the React's mutations in the DOM.
  useEffect(
    () => {
      clear();
      phasesRef.current.delete('rendering');
    },
    [value, clear],
  );

  useBeforeMutationRangeSaver(ref, selection);

  return {
    token,
    root: { ref },
    clear,
    subscribe,
    preventMutationRevert,
  };
};

export type MutationsPlugin = Plugin<typeof useMutationsPluginFactory>;

export const useMutationsPlugin = createUsePlugin<MutationsPlugin>(token);
