import { useRef } from 'react';

import {
  type PluginDependencies,
  type PluginMap,
  type UsePluginFactory,
} from './plugins';

export const usePluginContextFactory = (
  deps: Omit<PluginDependencies, 'plugins'>,
  props: object,
  plugins: UsePluginFactory[],
) => {
  const pluginsRef = useRef<PluginMap>({});

  const newProps = plugins.reduce((currentProps, make) => {
    const plugin = make(props, {
      ...deps,
      plugins: pluginsRef.current,
    });

    pluginsRef.current[plugin.token] = plugin;

    if (plugin.props) {
      return {
        ...currentProps,
        ...plugin.props,
      };
    }

    return currentProps;
  }, props);

  return { props: newProps, pluginsRef };
};
