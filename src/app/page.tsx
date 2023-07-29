'use client';

import { useState } from 'react';

import List from '@/shared/components/List';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

let startArr = 1;
let i = 0;
const newKey = () => `${++i}`;

export default function Home() {
  const [state, setState] = useState([
    { brick: 'paragraph', id: newKey(), children: '1Lorem ipsum dolar sit amet' },
    { brick: 'paragraph', id: newKey(), children: '2hello world' },
    { brick: 'paragraph', id: newKey(), children: ['3one child', ' ', 'another child'] },
    { brick: 'paragraph', id: newKey(), children: '4hello world with attributes', attributes: { test: true } },
  ]);

  return (
    <main>
      <button
        onClick={() => {
          const newId = newKey();
          const newValue = { brick: 'paragraph', children: `${state.length + 1} - ${Math.random()}`, id: newId };
          startArr += 1;
          setState((value: any) => [
            newValue,
            ...value.slice(0, startArr),
            { ...value[startArr], children: [value[startArr].children[0] + ` ${value.length + 1} `, ...value[startArr].children.slice(1)] },
            ...value.slice(startArr + 1),
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
