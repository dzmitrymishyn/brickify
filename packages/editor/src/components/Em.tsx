import { compile } from 'css-select';
import React, { type PropsWithChildren } from 'react';

import { extend } from '../bricks';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(Em, { is: compile('em') });
