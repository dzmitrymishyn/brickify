export const makePq = <T>(compare: (a: T, b: T) => number) => {
  const heap: T[] = [];

  const getLeftChildIndex = (parentIndex: number) => 2 * parentIndex + 1;
  const getRightChildIndex = (parentIndex: number) => 2 * parentIndex + 2;
  const getParentIndex = (childIndex: number) =>
    Math.floor((childIndex - 1) / 2);

  const hasLeftChild = (index: number) =>
    getLeftChildIndex(index) < heap.length;
  const hasRightChild = (index: number) =>
    getRightChildIndex(index) < heap.length;
  const hasParent = (index: number) => getParentIndex(index) >= 0;

  const leftChild = (index: number) => heap[getLeftChildIndex(index)];
  const rightChild = (index: number) => heap[getRightChildIndex(index)];
  const parent = (index: number) => heap[getParentIndex(index)];

  const swap = (indexOne: number, indexTwo: number) => {
    [heap[indexOne], heap[indexTwo]] = [heap[indexTwo], heap[indexOne]];
  };

  const heapifyDown = () => {
    let index = 0;
    while (hasLeftChild(index)) {
      let smallerChildIndex = getLeftChildIndex(index);
      if (
        hasRightChild(index)
        && compare(rightChild(index), leftChild(index)) > 0
      ) {
        smallerChildIndex = getRightChildIndex(index);
      }
      if (compare(heap[index], heap[smallerChildIndex]) > 0) {
        break;
      } else {
        swap(index, smallerChildIndex);
      }
      index = smallerChildIndex;
    }
  };

  const heapifyUp = () => {
    let index = heap.length - 1;
    while (hasParent(index) && compare(parent(index), heap[index]) <= 0) {
      swap(getParentIndex(index), index);
      index = getParentIndex(index);
    }
  };

  const peek = () => {
    if (heap.length === 0) {
      return null;
    }
    return heap[0];
  };

  const remove = () => {
    if (heap.length === 0) {
      return null;
    }
    const item = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.pop();
    heapifyDown();
    return item;
  };

  const add = (item: T) => {
    heap.push(item);
    heapifyUp();
  };

  return {
    peek,
    remove,
    add,
  };
};

export type PriorityQueue<T> = ReturnType<typeof makePq<T>>;
