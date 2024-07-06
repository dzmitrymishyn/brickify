import { addRange, fromCustomRange } from '@brickifyio/browser/selection';
import { type Node, patch } from '@brickifyio/utils/slots-tree';
import { pipe } from 'fp-ts/lib/function';
import {
  forwardRef,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import useMergedRefs from './useMergedRef';
import {
  type Component,
  useBricksBuilder,
} from '../bricks';
import { withBrickContext } from '../core';
import { type Change } from '../core/changes';
import { useBrickContext, useLogger } from '../core/hooks/useBrickContext';
import { useMutation } from '../core/hooks/useMutation';


type Props = {
  value: unknown[];
  // eslint-disable-next-line -- TODO: check it
  bricks?: Component<any>[];
  onChange?: (value: unknown) => void;
};

const emptyChangesState = (type: 'default' | 'browser' = 'default'): {
  type: 'default' | 'browser';
  changes: Change[];
} => ({
  type,
  changes: [],
});

const Editor = forwardRef<HTMLDivElement, Props>(({
  value,
  bricks = [],
  onChange,
}, refProp) => {
  const {
    ranges,
    clearMutations,
    trackChange,
  } = useBrickContext();
  const logger = useLogger();
  const changesState = useRef(emptyChangesState('default'));
  const onChangeRef = useRef<(value: unknown) => void>();

  onChangeRef.current = onChange;

  const emitChange = useCallback((changes: Change[], root?: Node) => {
    if (!changes.length || !root) {
      return;
    }

    const newValue = patch(root, changes) as {
      children: unknown;
    };

    logger.log('Editor value is updated', newValue.children);

    onChangeRef.current?.(newValue.children);
  }, [logger]);

  const [components, treeRef] = useBricksBuilder(value, bricks, (change) => {
    if (changesState.current.type === 'browser') {
      changesState.current.changes.push(trackChange(change));
      return;
    }
    emitChange([change], treeRef.current ?? undefined);
  });

  // When the components are updated we need to clear our MutationsArray to
  // prevent DOM restoring
  useEffect(clearMutations, [components, clearMutations]);
  useEffect(() => {
    pipe(ranges.getAfter(), fromCustomRange, addRange);
  }, [ranges, components]);

  const mutationRef: RefObject<HTMLElement> = useMutation({
    before: () => {
      changesState.current = emptyChangesState('browser');
    },
    after: () => {
      emitChange(changesState.current.changes, treeRef.current ?? undefined);
      changesState.current = emptyChangesState('default');
    },
  });

  const ref = useMergedRefs(mutationRef, refProp);

  return (
    <div
      ref={ref}
      data-brick="editor"
      contentEditable
      suppressContentEditableWarning
    >
      {components}
    </div>
  );
});

Editor.displayName = 'Editor';

export default pipe(
  Editor,
  withBrickContext,
);
