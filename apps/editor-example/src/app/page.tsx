'use client';


/* eslint no-unused-vars: off -- TODO: check */
/* eslint import/no-extraneous-dependencies: off -- TODO: check */
/* eslint @typescript-eslint/no-unused-vars: off -- TODO: check */

// import { ShiftEnterBr } from '@brickifyio/editor/components/Br';
import Article from '@brickifyio/editor/components/Article';
import Br from '@brickifyio/editor/components/Br';
import Container from '@brickifyio/editor/components/Container';
import Em from '@brickifyio/editor/components/Em';
import Heading from '@brickifyio/editor/components/Heading';
import List from '@brickifyio/editor/components/List';
import Strong from '@brickifyio/editor/components/Strong';
import Table from '@brickifyio/editor/components/Table';
import Editor from '@brickifyio/editor/Editor';
import Paragraph from '@brickifyio/editor/Paragraph';
import { extend, withProps } from '@brickifyio/renderer';
import React, { useMemo, useState } from 'react';

const Page = () => {
  const newKey = useMemo(() => {
    let i = 1000;
    return () => {
      i += 1;
      return `${i}`;
    };
  }, []);
  const [state, setState] = useState<unknown>(() => Array.from({ length: 1 }, () => [
    {
      id: newKey(),
      brick: 'Heading',
      value: 'Here is simple components that',
    },
    {
      id: newKey(),
      brick: 'Article',
      title: 'test title',
      description: 'looong description text is here',
    },
    {
      brick: 'Table',
      id: newKey(),
      children: [
        [
          'test line 0 1',
          '0 2',
          '0 3',
        ],
        ['1', '2', '3'],
      ],
    },
    {
      brick: 'List',
      id: newKey(),
      children: [
        '123',
        { id: newKey(), brick: 'ListItem', value: 'line1' },
        { id: newKey(), brick: 'ListItem', value: 'line2' },
      ]
      // children: [
      //   'It is a single level list',
      //   'Click enter to create a new line',
      //   'Click enter twice to create a new paragraph',
      // ],
    },
    // { brick: 'Test', id: newKey(), value: 'Test text', test: '123' },
    {
      brick: 'Container',
      id: newKey(),
      children: [
        { brick: 'Paragraph', id: newKey(), value: 'It is a <strong>paragraph</strong>!!' },

        {
          id: newKey(),
          brick: 'Article',
          title: 'test title',
          description: 'looong description text is here',
        },
      ],
    },
    { brick: 'Paragraph', id: newKey(), value: 'It is a <strong>paragraph</strong>' },
    // { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
    // ...Array.from({ length: 2000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), value: `${newKey()} hello world`,
    // })),
  ]).flat());

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <Editor
        style={{ padding: 20 }}
        // eslint-disable-next-line -- TODO: check it
        value={state as any}
        onChange={setState}
        components={{
          // List,
          Heading,
          List,
          Article,
          Paragraph: extend(Paragraph, withProps({ style: { margin: '16px 0' }, components: [Em, Strong, Br] })),
          Table,
          Container,
          // Test,
        }}
      />
      <pre style={{ overflow: 'scroll' }}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

export default Page;
