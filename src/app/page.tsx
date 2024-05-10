'use client';

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import { defaultProps, extend, slots } from '@/shared/bricks';
import Container from '@/shared/components/Container';
import Em from '@/shared/components/Em';
import Strong from '@/shared/components/Strong';
import Editor from '@/shared/Editor';
import { withMutations } from '@/shared/Editor/withMutations';
import Paragraph from '@/shared/Paragraph';

let startArr = 0;

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
    // ...Array.from({ length: 10000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), children: `${newKey()} hello world`,
    // })),
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <main>
      <ul>
        <li>1</li>
        <li>2</li>
      </ul>
      <button
        type="button"
        onClick={() => {
          const newId = newKey();
          const newValue = { brick: 'paragraph', children: `${state.length + 1} - ${Math.random()}`, id: newId };
          startArr += 1;
          setState((value: any) => [
            newValue,
            ...value.slice(0, -1),
            {
              ...value[value.length - 1],
              children: [
                't<strong>es</strong>t',
                'test',
                'test',
                { ...value[value.length - 1].children[3], children: `${Math.random()}` },
                ...value[value.length - 1].children.slice(4),
              ],
            },
          ]);
        }}
      >
        Update
      </button>
      <Editor
        value={state}
        bricks={[
          extend(Paragraph, defaultProps({ component: 'article', bricks: [Em, Strong] })),
          extend(Container, slots({ children: 'inherit' })),
        ]}
      />
    </main>
  );
}
