'use client';

import { addCustomChildren } from '@/shared/bricks';
import Paragraph from '@/shared/Paragraph';

import Text from './Text';

export default addCustomChildren(Paragraph.of(
  'list',
  'ul',
  [
    addCustomChildren(Paragraph.of('listItem', 'li', [Text]), (value: string) => typeof value === 'string'),
  ],
), (value: string[]) => Array.isArray(value));
