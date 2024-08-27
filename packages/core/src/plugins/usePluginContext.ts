import { useRef } from 'react';

import {
  type Plugin,
  type PluginDependencies,
  type UsePluginFactory,
} from './plugins';

export const usePluginContext = (
  deps: Omit<PluginDependencies, 'plugins'>,
  props: object,
  plugins: UsePluginFactory[],
) => {
  const pluginsRef = useRef<Record<string | symbol, Plugin>>({});

  const newProps = plugins.reduce((currentProps, init) => {
    const plugin = init(props, {
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
