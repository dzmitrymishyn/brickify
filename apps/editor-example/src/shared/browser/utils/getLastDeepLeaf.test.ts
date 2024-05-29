import { getLastDeepLeaf } from './getLastDeepLeaf';

const createDocument = () => {
  // We need to use such kind of style because template string with pretty format
  // creates a lot of additional text nodes between element
  document.body.innerHTML = ''
    + '<main>'
      + '<ul>'
        + '<li><strong>Lorem:</strong> ipsum dolar sit amet;</li>'
        + '<li>'
          + '<div>Lorem ipsum</div>'
          + '<div>dolar <strong>sit</strong> amet.</div>'
        + '</li>'
      + '</ul>'
    + '</main>';
};

it('should return last deep leaf', () => {
  createDocument();

  const result = getLastDeepLeaf(document.body);

  expect(result).toHaveTextContent('amet.');
});

it('should return null on nullable value', () => {
  expect(getLastDeepLeaf(null)).toBeNull();
  expect(getLastDeepLeaf(undefined)).toBeNull();
});

it('should return the same node', () => {
  const node = document.createTextNode('test node');

  expect(getLastDeepLeaf(node)).toBe(node);
});
