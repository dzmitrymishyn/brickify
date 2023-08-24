import { wrapToNode } from './wrapToNode';

const createDocument = () => {
  document.body.innerHTML = 'lorem <b>ipsum</b> dolar <i>sit</i> amet.';

  return { container: document.body };
};

it('should wrap children from a start node to end of the container', () => {
  const { container } = createDocument();
  const wrapper = document.createElement('strong');

  wrapToNode(wrapper, container.childNodes[1]);

  expect(container.childNodes).toHaveLength(2);
  expect(container.childNodes[1].childNodes).toHaveLength(4);
  expect(container.childNodes[0]).toHaveTextContent(/lorem/);
  expect(container.childNodes[1]).toHaveTextContent(/ipsum dolar sit amet\./);
});

it('should wrap children from an end to start of container', () => {
  const { container } = createDocument();
  const wrapper = document.createElement('strong');

  wrapToNode(wrapper, container.childNodes[3], null, false);

  expect(container.childNodes).toHaveLength(2);
  expect(container.childNodes[0].childNodes).toHaveLength(4);
  expect(container.childNodes[0]).toHaveTextContent(/lorem ipsum dolar sit/);
  expect(container.childNodes[1]).toHaveTextContent(/amet\./);
});

it('should wrap children from one element to another', () => {
  const { container } = createDocument();
  const wrapper = document.createElement('strong');

  wrapToNode(wrapper, container.childNodes[1], container.childNodes[3]);

  expect(container.childNodes).toHaveLength(3);
  expect(container.childNodes[1].childNodes).toHaveLength(3);
  expect(container.childNodes[0]).toHaveTextContent(/lorem/);
  expect(container.childNodes[1]).toHaveTextContent(/ipsum dolar sit/);
  expect(container.childNodes[2]).toHaveTextContent(/amet\./);
});

it('should wrap children from one element to another from right to left', () => {
  const { container } = createDocument();
  const wrapper = document.createElement('strong');

  wrapToNode(wrapper, container.childNodes[3], container.childNodes[1], false);

  expect(container.childNodes).toHaveLength(3);
  expect(container.childNodes[1].childNodes).toHaveLength(3);
  expect(container.childNodes[0]).toHaveTextContent(/lorem/);
  expect(container.childNodes[1]).toHaveTextContent(/ipsum dolar sit/);
  expect(container.childNodes[2]).toHaveTextContent(/amet\./);
});

it('should wrap children to the end of container when the end node is wrong node', () => {
  const { container } = createDocument();
  const wrapper = document.createElement('strong');

  wrapToNode(wrapper, container.childNodes[1], document.createElement('div'));

  expect(container.childNodes).toHaveLength(2);
  expect(container.childNodes[1].childNodes).toHaveLength(4);
  expect(container.childNodes[0]).toHaveTextContent(/lorem/);
  expect(container.childNodes[1]).toHaveTextContent(/ipsum dolar sit amet\./);
});
