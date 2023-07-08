'use client';

import { useState } from 'react';

import List from '@/shared/components/List';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

export default function Home() {
  const [state, setState] = useState([
    'Lorem ipsum dolar sit amet',
    { brick: 'paragraph', children: 'hello world' },
    { brick: 'paragraph', children: ['one child', ' ', 'another child'] },
    { brick: 'paragraph', children: 'hello world with attributes', attributes: { test: true } },
    // List
    ['hello', 'world'],
  ]);

  return (
    <main>
      <button
        onClick={() => {
          setState((value: any) => [
            `${value[0]}1`,
            { ...value[1], children: value[1].children + 't' },
            ...value.slice(2),
          ]);
        }}
      >
        Update
      </button>
      <Editor
        value={state}
        bricks={[Paragraph, List]}
      />
    </main>
  );
}
