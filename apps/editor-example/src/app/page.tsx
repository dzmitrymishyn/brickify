'use client';


/* eslint no-unused-vars: off -- TODO: check */
/* eslint import/no-extraneous-dependencies: off -- TODO: check */
/* eslint @typescript-eslint/no-unused-vars: off -- TODO: check */

// import { extend, withProps, withSlots } fromyarn '@brickifyio/core';
// import { ShiftEnterBr } from '@brickifyio/editor/components/Br';
import Container from '@brickifyio/editor/components/Container';
import Em from '@brickifyio/editor/components/Em';
import Heading from '@brickifyio/editor/components/Heading';
// import List from '@brickifyio/editor/components/List';
import Strong from '@brickifyio/editor/components/Strong';
// import Table from '@brickifyio/editor/components/Table';
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
    // {
    //   brick: 'Table',
    //   id: newKey(),
    //   children: [
    //     [
    //       'Click `Tab` to move to the next cell',
    //       'Click `Shift + Tab` to move to the previous cell',
    //       'Click `Tab` to move to the next element',
    //     ],
    //   ],
    // },
    // {
    //   brick: 'List',
    //   id: newKey(),
    //   children: [
    //     'It is a single level list',
    //     'Click enter to create a new line',
    //     'Click enter twice to create a new paragraph',
    //   ],
    // },
    // { brick: 'Test', id: newKey(), value: 'Test text', test: '123' },
    { brick: 'Paragraph', id: newKey(), value: 'It is a <strong>paragraph</strong>' },
    // {
    //   brick: 'Container',
    //   id: newKey(),
    //   children: [
    //     { brick: 'Paragraph', id: newKey(), value: 'It is a <strong>paragraph</strong>' },
    //   ],
    // },
    // { brick: 'Paragraph', id: newKey(), value: '1Lorem ipsum dolar sit amet' },
    // ...Array.from({ length: 2000 }, () => ({
    //   brick: 'Paragraph', id: newKey(), value: `${newKey()} hello world`,
    // })),
  ]).flat());

  return (
    <div>
      <Editor
        style={{ padding: 20 }}
        // eslint-disable-next-line -- TODO: check it
        value={state as any}
        onChange={(newValue) => { setState(newValue); }}
        components={[
          // List,
          Heading,
          extend(Paragraph, withProps({ components: [Em, Strong] })),
          // Table,
          // Container,
          // Test,
        ]}
      />
      <pre>
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
};

export default Page;
