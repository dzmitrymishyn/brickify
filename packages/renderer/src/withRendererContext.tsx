/* eslint-disable react-hooks/rules-of-hooks --
 * It's justified. If we have inherited context it means that we don't need
 * to apply the same rules for all the actions. Parent component already
 * added it
 */
import { array } from '@brickifyio/operators';
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type RefObject,
  useMemo,
} from 'react';

import { type BrickValue } from './bricks';
import { getName } from './components';
import { RendererContext, useRendererContextUnsafe } from './context';
import { extend, withBrickName } from './extensions';
import { useMergedRefs } from './hooks';
import {
  getPlugins,
  usePluginContextFactory,
  type UsePluginFactory,
} from './plugins';
import { type RendererStoreValue, useRendererStoreFactory } from './store';
import { makeRef } from './utils';

type Props = {
  plugins?: (UsePluginFactory | UsePluginFactory[])[];
  value: BrickValue[];
};

export function withRendererContext<P extends object>(
  Component: ForwardRefExoticComponent<P>,
  defaultProps: object,
) {
  type ContextProps = Props
    & Omit<P, 'stored' | 'value' | 'editable' | 'plugins'>;
  const WithRendererContext = forwardRef<Node, ContextProps>((
    initialProps,
    refProp,
  ) => {
    const props = { ...defaultProps, ...initialProps } as ContextProps;
    const inheritedContext = useRendererContextUnsafe();

    if (inheritedContext) {
      return (
        <Component ref={refProp} {...props as P} />
      );
    }

    const store = useRendererStoreFactory();
    const stored: RendererStoreValue = {
      value: props.value,
      pathRef: makeRef(() => []),
    };

    const { pluginsRef, props: newProps } = usePluginContextFactory(
      { store, stored },
      props,
      array(props.plugins ?? []).flat(),
    );

    const ref = useMergedRefs(
      refProp,
      ...getPlugins(pluginsRef.current)
        .map((plugin) => plugin.ref)
        .filter(Boolean) as RefObject<Node>[],
    );

    const contextValue = useMemo(() => ({
      plugins: pluginsRef.current,
      store,
    }), [pluginsRef, store]);

    return (
      <RendererContext.Provider value={contextValue}>
        <Component
          {...newProps as P}
          ref={ref}
          stored={stored}
        />
      </RendererContext.Provider>
    );
  });

  WithRendererContext.displayName = (
    `WithRendererContext(${getName(Component)})`
  );

  return extend(
    WithRendererContext,
    Component,
    withBrickName(getName(Component)),
  );
};
