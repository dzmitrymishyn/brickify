import List from '@/shared/components/List';
import Editor from '@/shared/Editor';
import Paragraph from '@/shared/Paragraph';

export default function Home() {
  return (
    <main>
      <Editor
        value={[
          'Lorem ipsum dolar sit amet',
          { brick: 'paragraph', children: ['hello ', 'world'] },
          ['hello', 'world'],
        ]}
        bricks={[Paragraph, List]}
      />
    </main>
  );
}
