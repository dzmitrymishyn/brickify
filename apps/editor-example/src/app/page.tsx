'use client';


/* eslint no-unused-vars: off -- TODO: check */
/* eslint @typescript-eslint/no-unused-vars: off -- TODO: check */

import { extend, withProps, withSlots } from '@brickifyio/core';
import { ShiftEnterBr } from '@brickifyio/editor/components/Br';
import Container from '@brickifyio/editor/components/Container';
import Em from '@brickifyio/editor/components/Em';
import Heading from '@brickifyio/editor/components/Heading';
import List from '@brickifyio/editor/components/List';
import Profile from '@brickifyio/editor/components/Profile';
import Strong from '@brickifyio/editor/components/Strong';
import Editor from '@brickifyio/editor/Editor';
import Paragraph from '@brickifyio/editor/Paragraph';
import React, { useMemo, useState } from 'react';

const Page = () => {
  const newKey = useMemo(() => {
    let i = 1000;
    return () => {
      i += 1;
      return `${i}`;
    };
  }, []);
  // const [state2, setState2] = useState<unknown>(() => [
  //   { brick: 'Paragraph', id: newKey(), value: '1Lorem <strong style="color: red"><strong>i<em>ps</em>um</strong></strong> dolar sit <strong>amet</strong>' },
  // ]);
  const [state, setState] = useState<unknown>(() => Array.from({ length: 1 }, () => [
    {
      brick: 'Heading',
      id: newKey(),
      value: 'Here is simple components that',
    },
    {
      brick: 'List',
      id: newKey(),
      children: [
        {
          brick: 'ListItem',
          id: newKey(),
          value: 'List with item number 1',
        },
        {
          brick: 'ListItem',
          id: newKey(),
          value: 'List with item number 2',
        },
        {
          brick: 'ListItem',
          id: newKey(),
          value: '<em>Try to add new list item</em>',
        },
      ],
    },
    { brick: 'Paragraph', id: newKey(), value: 'It is a <strong>paragraph</strong>' },
    // {
    //   brick: 'Profile',
    //   id: newKey(),
    //   children: 'Hi <strong>everyone</strong>!',
    //   visible: true,
    //   // children: [
    //   //   { brick: 'Paragraph', id: newKey(), children: 'Hi <strong>everyone</strong>!' },
    //   // ],
    // },
    // { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
    // ...Array.from({ length: 2000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), value: `${newKey()} hello world`,
    // })),
  ]).flat());
  const [editable, setEditable] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setEditable((oldEditable) => !oldEditable)}
      >
        {editable ? 'Disable' : 'Enable'}
        {' '}
        editable mode
      </button>
      <Editor
        // eslint-disable-next-line -- TODO: check it
        value={state as any}
        editable={editable}
        onChange={(newValue) => { setState(newValue); }}
        bricks={[
          List,
          extend(
            Editor,
            withProps({
              bricks: [
                extend(Paragraph, withProps({ component: 'div', bricks: [ShiftEnterBr] })),
                Container,
              ] ,
            }),
          ),
          Heading,
          extend(Paragraph, withProps({ component: 'article', bricks: [Em, Strong, ShiftEnterBr] })),
          extend(Container, withSlots({ children: 'inherit' })),
          Profile,
        ]}
      />
      <pre>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

export default Page;
