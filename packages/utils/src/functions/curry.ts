export type Curried1<P1, R> = (p1: P1) => R;

export type Curried2<P1, P2, R> = {
  (p1: P1): Curried1<P2, R>;
  (p1: P1, p2: P2): R;
};

export type Curried3<P1, P2, P3, R> = {
  (p1: P1, p2: P2, p3: P3): R;
  (p1: P1, p2: P2): (p3: P3) => R;
  (p1: P1): Curried2<P2, P3, R>;
};

export type Curried4<P1, P2, P3, P4, R> = {
  (p1: P1, p2: P2, p3: P3, p4: P4): R;
  (p1: P1, p2: P2, p3: P3): Curried1<P4, R>;
  (p1: P1, p2: P2): Curried2<P3, P4, R>;
  (p1: P1): Curried3<P2, P3, P4, R>;
};

export type Curried5<P1, P2, P3, P4, P5, R> = {
  (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5): R;
  (p1: P1, p2: P2, p3: P3, p4: P4): Curried1<P5, R>;
  (p1: P1, p2: P2, p3: P3): Curried2<P4, P5, R>;
  (p1: P1, p2: P2): Curried3<P3, P4, P5, R>;
  (p1: P1): Curried4<P2, P3, P4, P5, R>;
};

export type Curry = {
  <P1, R>(fn: (p1: P1) => R): Curried1<P1, R>;
  <P1, P2, R>(fn: (p1: P1, p2: P2) => R): Curried2<P1, P2, R>;
  <P1, P2, P3, R>(fn: (p1: P1, p2: P2, p3: P3) => R): Curried3<P1, P2, P3, R>;
  <P1, P2, P3, P4, R>(
    fn: (p1: P1, p2: P2, p3: P3, p4: P4) => R,
  ): Curried4<P1, P2, P3, P4, R>;
  <P1, P2, P3, P4, P5, R>(
    fn: (p1: P1, p2: P2, p3: P3, p4: P4, p5: P5) => R,
  ): Curried5<P1, P2, P3, P4, P5, R>;
};

export const curry = ((fn: (...args: unknown[]) => unknown) => {
  return function curried(...args: unknown[]) {
    if (args.length >= fn.length) {
      return fn(...args);
    }

    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  };
}) as Curry;
