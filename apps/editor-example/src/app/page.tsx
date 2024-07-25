'use client';


/* eslint no-unused-vars: off -- TODO: check */
/* eslint @typescript-eslint/no-unused-vars: off -- TODO: check */

import { ShiftEnterBr } from '@brickifyio/editor/components/Br';
import Container from '@brickifyio/editor/components/Container';
import Em from '@brickifyio/editor/components/Em';
import Heading from '@brickifyio/editor/components/Heading';
import Profile from '@brickifyio/editor/components/Profile';
import Strong from '@brickifyio/editor/components/Strong';
import { extend, withProps, withSlots } from '@brickifyio/editor/core';
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
      brick: 'Editor',
      id: newKey(),
      value: [
        { brick: 'Paragraph', id: newKey(), value: '1Lorem <strong>ipsum</strong> dolar sit amet' },
        {
          brick: 'Container',
          id: newKey(),
          children: [
            // 'test',
            // 'test',
            // 'test',
            { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
            { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
            { brick: 'Paragraph', id: newKey(), value: '2hello world' },
            { brick: 'Paragraph', id: newKey(), value: ['3one child', ' ', 'another child'] },
            {
              brick: 'Container',
              id: newKey(),
              children: [
                // 'test',
                // 'test',
                // 'test',
                { brick: 'Paragraph', id: newKey(), value: '----------' },
                { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
                { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
                { brick: 'Paragraph', id: newKey(), value: '2hello world' },
                { brick: 'Paragraph', id: newKey(), value: '----------' },
              ],
            },
          ],
        },
      ],
    },
    { brick: 'Heading', id: newKey(), value: 'Heading' },
    { brick: 'Paragraph', id: newKey(), value: 'First line start <strong style="color: red"><strong>11str str<em>12st em</em>13str str</strong></strong> 14 <strong>15 st</strong>' },
    { brick: 'Paragraph', id: newKey(), value: 'Second line start <strong>21 st</strong> 22' },
    { brick: 'Paragraph', id: newKey(), value: ['3rd line 31', ' 32 ', '33'] },
    // {
    //   brick: 'Paragraph', id: newKey(), value: '4th line lorem <em>ipsum dolar sit amet</em>', attributes: { test: true },
    // },
    // {
    //   brick: 'Container',
    //   id: newKey(),
    //   children: [
    //     // 'test',
    //     // 'test',
    //     // 'test',
    //     { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
    //     { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
    //     { brick: 'Paragraph', id: newKey(), value: '2hello world' },
    //     { brick: 'Paragraph', id: newKey(), value: ['<strong>3one child</strong>', ' ', 'another child'] },
    //   ],
    // },
    {
      brick: 'Profile',
      id: newKey(),
      children: 'Hi <strong>everyone</strong>!',
      visible: true,
      // children: [
      //   { brick: 'Paragraph', id: newKey(), children: 'Hi <strong>everyone</strong>!' },
      // ],
    },
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
        logger={console}
        onChange={(newValue) => { setState(newValue); }}
        bricks={[
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
