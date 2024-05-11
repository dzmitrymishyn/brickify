'use client';

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import { defaultProps, extend, slots } from '@/shared/bricks';
import Container from '@/shared/components/Container';
import Em from '@/shared/components/Em';
import Profile from '@/shared/components/Profile';
import Strong from '@/shared/components/Strong';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

export default function Home() {
  const newKey = useMemo(() => {
    let i = 1000;
    return () => {
      i += 1;
      return `${i}`;
    };
  }, []);
  const [state, setState] = useState(() => [
    { brick: 'Paragraph', id: newKey(), children: '1Lorem <strong style="color: red"><strong>i<em>ps</em>um</strong></strong> dolar sit <strong>amet</strong>' },
    { brick: 'Paragraph', id: newKey(), children: '<strong>2hello</strong> world' },
    { brick: 'Paragraph', id: newKey(), children: ['3one child', ' ', 'another child'] },
    {
      brick: 'Paragraph', id: newKey(), children: '4hello world with attributes', attributes: { test: true },
    },
    {
      brick: 'Container',
      id: newKey(),
      children: [
        // 'test',
        // 'test',
        // 'test',
        { brick: 'Paragraph', id: newKey(), children: '1Lorem ipsum dolar sit amet' },
        { brick: 'Paragraph', id: newKey(), children: '1Lorem ipsum dolar sit amet' },
        { brick: 'Paragraph', id: newKey(), children: '2hello world' },
        { brick: 'Paragraph', id: newKey(), children: ['3one child', ' ', 'another child'] },
      ],
    },
    {
      brick: 'Profile',
      id: newKey(),
      children: [
        { brick: 'Paragraph', id: newKey(), children: 'Hi <strong>everyone</strong>!' },
      ],
    },
    // ...Array.from({ length: 10000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), children: `${newKey()} hello world`,
    // })),
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <Editor
      value={state}
      onChange={(changes) => {
        setState((oldState) => oldState.map((value) => {
          const newState = changes.find((a: any) => a.id === value.id);
          return newState || value as any;
        }));
      }}
      bricks={[
        extend(Paragraph, defaultProps({ component: 'article', bricks: [Em, Strong] })),
        extend(Container, slots({ children: 'inherit' })),
        Profile,
      ]}
    />
  );
}
