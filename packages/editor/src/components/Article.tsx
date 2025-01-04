import {
  getRange,
  restoreRange,
  toRangeCopy,
} from '@brickifyio/browser/selection';
import {
  applySlots,
  extend,
  hasProps,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
} from '@brickifyio/renderer';

import { type PropsWithChange } from '../changes';
import { useMutation } from '../mutations';
import Paragraph from '../Paragraph';

type Value = {
  title: string;
  description: string;
};

type Props = PropsWithStoredValue<Value> & PropsWithChange<Value> & Value;

export const Article: React.FC<Props> = ({ stored, title, description, onChange }) => {
  const ref = useRendererRegistry<HTMLElement>(stored);

  const { markToRevert } = useMutation(ref, ({ removed, mutations }) => {
    markToRevert(mutations);

    if (removed) {
      onChange?.(undefined);
    }

    const range = toRangeCopy(getRange());

    ref.current?.childNodes.forEach((node, index) => {
      if (node instanceof HTMLElement && index < 2) {
        onChange?.({
          [index === 0 ? 'title' : 'description']: node.innerHTML,
        });
      } else if (
        index === 2
        && node instanceof HTMLElement
        && description
      ) {
        ref.current?.insertAdjacentElement('afterend', node);
      } else if (index > 2 && node instanceof HTMLElement) {
        ref.current?.insertAdjacentElement('afterend', node);
      }
    });

    restoreRange(range);
  });
  const components = applySlots<{
    Paragraph: typeof Paragraph;
    Heading: typeof Paragraph;
  }>([
    Paragraph,
    ['Heading', Paragraph, { component: 'h2' }],
  ], stored?.components ?? {});

  const Heading = components.Heading;
  const TextElement = components.Paragraph;

  return (
    <article
      data-brick="Article"
      ref={ref}
      style={{ border: '1px solid #ccc', margin: 8 }}
    >
      <Heading
        style={{ marginTop: 0 }}
        onChange={(value) => onChange?.(
          // Remove the component if we remove the title
          value?.value === undefined
            ? undefined
            : { title: `${value?.value ?? ''}` },
        )}
        {...hasProps(Heading) && Heading.props}
        value={title}
      />
      <TextElement
        // If the paragraph is removed just clear the value
        {...hasProps(TextElement) && TextElement.props}
        onChange={(value) => onChange?.({
          description: `${value?.value ?? ''}`,
        })}
        value={description}
      />
    </article>
  );
};

export default extend(
  Article,
  withName('Article'),
);
