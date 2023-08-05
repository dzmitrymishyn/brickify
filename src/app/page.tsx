'use client';

import { useState } from 'react';

import Container from '@/shared/components/Container';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

let startArr = 1;
let i = 1000;
const newKey = () => {
  i += 1;
  return `${i}`;
};

export default function Home() {
  const [state, setState] = useState([
    { brick: 'paragraph', id: newKey(), children: '1Lorem ipsum dolar sit amet' },
    { brick: 'paragraph', id: newKey(), children: '2hello world' },
    { brick: 'paragraph', id: newKey(), children: ['3one child', ' ', 'another child'] },
    {
      brick: 'paragraph', id: newKey(), children: '4hello world with attributes', attributes: { test: true },
    },
    {
      brick: 'container',
      children: [
        { brick: 'paragraph', id: newKey(), children: '1Lorem ipsum dolar sit amet' },
        { brick: 'paragraph', id: newKey(), children: '2hello world' },
        { brick: 'paragraph', id: newKey(), children: ['3one child', ' ', 'another child'] },
      ],
    },
  ]);

  return (
    <main>
      <button
        type="button"
        onClick={() => {
          const newId = newKey();
          const newValue = { brick: 'paragraph', children: `${state.length + 1} - ${Math.random()}`, id: newId };
          startArr += 1;
          setState((value: any) => [
            newValue,
            ...value.slice(0, startArr),
            { ...value[startArr], children: [`${value[startArr].children[0]} ${value.length + 1} `, ...value[startArr].children.slice(1)] },
            ...value.slice(startArr + 1),
          ]);
        }}
      >
        Update
      </button>
      <Editor
        value={state}
        bricks={[Paragraph, Container]}
      />
    </main>
  );
}
