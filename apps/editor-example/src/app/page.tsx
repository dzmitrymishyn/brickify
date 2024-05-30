'use client';


/* eslint no-unused-vars: off -- TODO: check */
/* eslint @typescript-eslint/no-unused-vars: off -- TODO: check */

import React, {
  forwardRef,
  useEffect, useMemo, useRef, useState,
} from 'react';

import {
  defaultProps,
  extend,
  slots,
  withMutations,
} from '@/shared/bricks';
import Container from '@/shared/components/Container';
import Em from '@/shared/components/Em';
import Profile from '@/shared/components/Profile';
import Strong from '@/shared/components/Strong';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

const Home = () => {
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
    { brick: 'Paragraph', id: newKey(), value: 'First line start <strong style="color: red"><strong>11str str<em>12st em</em>13str str</strong></strong> 14 <strong>15 st</strong>' },
    { brick: 'Paragraph', id: newKey(), value: 'Second line start <strong>21 st</strong> 22' },
    { brick: 'Paragraph', id: newKey(), value: ['3rd line 31', ' 32 ', '33'] },
    {
      brick: 'Paragraph', id: newKey(), value: '4th line lorem <em>ipsum dolar sit amet</em>', attributes: { test: true },
    },
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
        { brick: 'Paragraph', id: newKey(), value: ['<strong>3one child</strong>', ' ', 'another child'] },
      ],
    },
    {
      brick: 'Profile',
      id: newKey(),
      children: 'Hi <strong>everyone</strong>!',
      visible: true,
      // children: [
      //   { brick: 'Paragraph', id: newKey(), children: 'Hi <strong>everyone</strong>!' },
      // ],
    },
    // ...Array.from({ length: 2000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), value: `${newKey()} hello world`,
    // })),
  ]).flat());

  return (
    <div>
      <Editor
        // eslint-disable-next-line -- TODO: check it
        value={state as any}
        onChange={(newValue) => { setState(newValue); }}
        bricks={[
          extend(Paragraph, defaultProps({ component: 'article', bricks: [Em, Strong] })),
          extend(Container, slots({ children: 'inherit' })),
          Profile,
        ]}
      />
    </div>
  );
}

export default Home;
