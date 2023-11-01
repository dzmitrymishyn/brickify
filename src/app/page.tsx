'use client';

import { reshape } from '@/shared/browser/manipulations';

export default function Home() {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <main
      contentEditable
      suppressContentEditableWarning
      style={{
        padding: 20,
      }}
      onKeyDown={(event) => {
        let range;
        if (event.code === 'Escape') {
          event.preventDefault();
          range = reshape(
            { create: () => document.createElement('strong'), selector: 'strong' },
            window.getSelection()!.getRangeAt(0)!,
            document.querySelector('main'),
          );
        }

        if (event.code === 'Tab') {
          event.preventDefault();
          range = reshape(
            { create: () => document.createElement('i'), selector: 'i' },
            window.getSelection()!.getRangeAt(0)!,
            document.querySelector('main'),
          );
        }

        if (range) {
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
        }
      }}
    >
      It&apos;s not react components yet. You can try to use
      {' '}
      <strong>escape (to make text strong)</strong>
      {' '}
      and
      {' '}
      <em>tab (to make text em)</em>
      {' '}
      to see how it works.
      <br />
      <br />
      You can write text with spaces/new lines and experiment with reshape function.
    </main>
  );
}
