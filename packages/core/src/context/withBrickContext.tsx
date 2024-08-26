// If we have inherited context it means that we don't need to apply the same
// rules for all the actions. Parent component already added it
/* eslint-disable react-hooks/rules-of-hooks -- it's justified */
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type RefObject,
  useMemo,
} from 'react';

import { BrickContext } from './BrickContext';
import { CommonPlugins } from './commonPlugins';
import { useDisallowHotkeys } from './useDisallowHotkeys';
import { type BrickValue, getName } from '../components';
import { extend, withBrickName, withDisplayName } from '../extensions';
import { useBrickContextUnsafe , useMergedRefs } from '../hooks';
import { getPlugins, usePluginContext, type UsePluginFactory } from '../plugins';
import { type BrickStoreValue, useBrickStoreFactory } from '../store';

const metaKeyDisallowList = [
  'enter',
  'shift+enter',
  ...[
    // 'z', // undo
    'b', // bold
    'i', // italic
    'u', // underline
  ].map((key) => [`ctrl+${key}`, `cmd+${key}`]),
].flat();

type Props = {
  editable?: boolean;
  onChange?: (value: unknown) => void;
  brick?: BrickStoreValue;
};

export function withBrickContext<P extends { value: BrickValue[] }>(
  Component: ForwardRefExoticComponent<P>,
) {
  const WithBrickContext = forwardRef<Node, Props & Omit<P, 'brick' | 'plugins'> & { plugins?: (UsePluginFactory | UsePluginFactory[])[] }>((
    { plugins = [CommonPlugins], ...props },
    refProp,
  ) => {
    const inheritedContext = useBrickContextUnsafe();

    if (inheritedContext) {
      return (
        <Component {...props as P} />
      );
    }

    const store = useBrickStoreFactory();
    const newBrick = {
      value: props.value,
      pathRef: { current: () => [] },
    };

    const { pluginsRef, props: newProps } = usePluginContext(
      { store, brick: newBrick },
      props,
      plugins?.flat(),
    );
    const disalowKeyboardRef = useDisallowHotkeys(metaKeyDisallowList);

    const ref = useMergedRefs(
      refProp,
      ...getPlugins(pluginsRef.current)
        .map((plugin) => plugin.ref)
        .filter(Boolean) as RefObject<Node>[],
      disalowKeyboardRef,
    );

    const contextValue = useMemo(() => ({
      plugins: pluginsRef.current,
      editable: props.editable || false,
      store,
    }), [
      pluginsRef,
      props.editable,
      store,
    ]);

    return (
      <BrickContext.Provider value={contextValue}>
        <Component
          {...newProps as P}
          ref={ref}
          brick={newBrick}
        />
      </BrickContext.Provider>
    );
  });

  return extend(
    WithBrickContext,
    Component,
    withBrickName(getName(Component)),
    withDisplayName(`WithBrickContext(${getName(Component) ?? 'Unnamed'})`),
  );
};
