import { useEffect, useRef } from 'react';

import { useBrickContext } from '../hooks';
import assert from 'assert';

type Subscriber = {
  before?: () => void;
  apply?: () => void;
};

export const useBatchChanges = (subscriber: Subscriber) => {
  const ref = useRef<HTMLElement>(null);
  const { changes: { subscribeBatch } } = useBrickContext();
  const subscriberRef = useRef<Subscriber>({
    before: undefined,
    apply: undefined,
  });

  subscriberRef.current.before = subscriber.before;
  subscriberRef.current.apply = subscriber.apply;

  useEffect(() => {
    assert(ref.current, 'useBatchChanges: ref should be attached to a node');

    return subscribeBatch(ref.current, {
      get apply() {
        return subscriberRef.current.apply;
      },
      get before() {
        return subscriberRef.current.before;
      },
    });
  }, [subscribeBatch, subscriber]);

  return ref;
};
