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
      value: 'Here is a simple heading',
    },
    {
      id: newKey(),
      brick: 'Paragraph',
      value: `
        I do not know how it will go in the future but for now the beauty is
        that I can select several table columns + list after the table and 
        maybe the container and pres <em>cmd + b</em> or <em>ctrl + b</em>
        and <strong>it transforms the text for each specific item</strong> and 
        <strong>doesn't transform components that don't support it</strong>.
      `,
    },
    {
      id: newKey(),
      brick: 'Article',
      title: "It's just more complex component",
      description: `
        I just called it paragraph. There is no idea under the component. Only
        the idea that you cannot remove description (the second line) and if
        you add one line after the title the description will move to the next
        paragraph. It doesn't support any inline elements, only plain text.
      `,
    },
    {
      brick: 'Table',
      id: newKey(),
      children: [
        [
          'Just',
          'a',
          'table',
        ],
        ['with 2 lines of content', '<strong>Dummy</strong> content', ''],
      ],
    },
    {
      brick: 'List',
      id: newKey(),
      children: [
        'Bullet list line 1. It represents like a string',
        {
          id: newKey(),
          brick: 'ListItem',
          value: 'But you can use a component with id. This also works.',
        },
        {
          id: newKey(),
          brick: 'ListItem',
          value: `
            I did not change the native behavior and if you add one empty line 
            and another one - it will transform it into paragraph. The same 
            behavior for the first line.
          `,
        },
      ]
    },
    {
      brick: 'Container',
      id: newKey(),
      children: [
        {
          brick: 'Paragraph',
          id: newKey(),
          value: `
            This is a container component. It can place all the elements its 
            parent does.
          `,
        },
        {
          id: newKey(),
          brick: 'Article',
          title: 'Article',
          description: 'For example the article with no meaning',
        },
      ],
    },
    {
      brick: 'Paragraph',
      id: newKey(),
      value: 'Empty <strong>paragraph</strong>',
    },
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
