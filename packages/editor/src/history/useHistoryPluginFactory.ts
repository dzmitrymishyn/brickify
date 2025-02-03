import { type AnyRange, getRange, toCustomRange } from '@brickifyio/browser/selection';
import {
  createUsePlugin,
  type Plugin,
  type PluginDependencies,
} from '@brickifyio/renderer';
import { useBeforeRender } from '@brickifyio/utils/hooks';
import { type Change } from '@brickifyio/utils/object';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { useChangesPlugin } from '../changes';
import { useCommand } from '../commands';
import { useSelectionPlugin } from '../selection';

export const historyToken = Symbol('HistoryPlugin');

type OneWayItem = {
  changes: Change[];
  range?: AnyRange | null;
};

type Props = {
  value: unknown
};

export const useHistoryPluginFactory = (
  { value }: Props,
  { plugins }: PluginDependencies,
) => {
  const { emitChanges } = useChangesPlugin(plugins);
  const {
    storeRange,
    getRange: getSelectionRange,
  } = useSelectionPlugin(plugins);
  const ref = useRef<HTMLElement>(null);
  const ranges = useRef<{ undo?: AnyRange | null; redo?: AnyRange | null }>({});

  const activeIndexRef = useRef(-1);
  const undoRef = useRef<OneWayItem[]>([]);
  const redoRef = useRef<OneWayItem[]>([]);

  const wasUndo = useRef(true);
  const tempUndoRef = useRef<Change[]>([]);
  const tempRedoRef = useRef<Change[]>([]);

  const undo = useCallback(() => {
    if (activeIndexRef.current < 0) {
      return;
    }

    emitChanges(undoRef.current[activeIndexRef.current].changes);
    storeRange(undoRef.current[activeIndexRef.current].range, 'afterMutation');
    wasUndo.current = true;
    activeIndexRef.current -= 1;
  }, [emitChanges, storeRange]);

  const redo = useCallback(() => {
    if (activeIndexRef.current >= redoRef.current.length - 1) {
      return;
    }

    activeIndexRef.current += 1;
    wasUndo.current = true;
    emitChanges(redoRef.current[activeIndexRef.current].changes);
    storeRange(redoRef.current[activeIndexRef.current].range, 'afterMutation');
  }, [emitChanges, storeRange]);

  const commit = useCallback((diff: { undo: Change[], redo: Change[] }) => {
    tempUndoRef.current.push(...diff.undo);
    tempRedoRef.current.push(...diff.redo);
  }, []);

  useBeforeRender(() => {
    ranges.current.redo = getSelectionRange('afterMutation');
    ranges.current.undo = ref.current
      ? toCustomRange(ref.current)(getRange())
      : null;
  }, [value]);

  useLayoutEffect(() => {
    if (
      !wasUndo.current
      && tempUndoRef.current.length && tempRedoRef.current.length
    ) {
      undoRef.current = undoRef.current.slice(0, activeIndexRef.current + 1);
      redoRef.current = undoRef.current.slice(0, activeIndexRef.current + 1);

      undoRef.current.push({
        changes: tempUndoRef.current,
        range: ranges.current.undo,
      });
      redoRef.current.push({
        changes: tempRedoRef.current,
        range: ranges.current.redo,
      });

      activeIndexRef.current += 1;
    }

    ranges.current = {};
    wasUndo.current = false;
    tempUndoRef.current = [];
    tempRedoRef.current = [];
  }, [value]);

  useCommand(ref, {
    shortcuts: ['cmd + z', 'ctrl + z'],
    name: 'undo',
    handle: undo,
  }, plugins);

  useCommand(ref, {
    shortcuts: ['cmd + shift + z', 'ctrl + shift + z'],
    name: 'redo',
    handle: redo,
  }, plugins);

  return useMemo(() => ({
    token: historyToken,
    root: { ref },
    undo,
    redo,
    commit,
  }), [undo, redo, commit]);
};

export type HistoryPlugin = Plugin<typeof useHistoryPluginFactory>;

export const useHistoryPlugin = createUsePlugin<HistoryPlugin>(historyToken);
