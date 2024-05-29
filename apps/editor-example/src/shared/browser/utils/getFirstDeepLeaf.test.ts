import { getFirstDeepLeaf } from './getFirstDeepLeaf';

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

it('should return first deep leaf', () => {
  createDocument();

  const result = getFirstDeepLeaf(document.body);

  expect(result).toHaveTextContent('Lorem:');
});

it('should return null on nullable value', () => {
  expect(getFirstDeepLeaf(null)).toBeNull();
  expect(getFirstDeepLeaf(undefined)).toBeNull();
});

it('should return the same node', () => {
  const node = document.createTextNode('test node');

  expect(getFirstDeepLeaf(node)).toBe(node);
});
