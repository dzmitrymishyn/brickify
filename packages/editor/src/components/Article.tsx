import {
  extend,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
} from '@brickifyio/renderer';

import Strong from './Strong';
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
  });

  return (
    <article
      data-brick="Article"
      ref={ref}
      style={{ border: '1px solid #ccc' }}
    >
      <Paragraph
        style={{ marginTop: 0 }}
        onChange={(value) => onChange?.(
          // Remove the component if we remove the title
          value?.value === undefined
            ? undefined
            : { title: `${value?.value ?? ''}` },
        )}
        component="h2"
        value={title}
      />
      <Paragraph
        components={[Strong]}
        // If the paragraph is removed just clear the value
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
