import { Lens } from '@zhujianshi/lens';

type Setter<A> = A | ((x: A) => A);

export type SharedApi<S> = {
  useLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
    K5 extends keyof S[K0][K1][K2][K3][K4] = keyof S[K0][K1][K2][K3][K4],
  >(
    path: [K0, K1, K2, K3, K4, K5],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4][K5],
      rhs: S[K0][K1][K2][K3][K4][K5],
    ) => boolean,
  ): [
    S[K0][K1][K2][K3][K4][K5],
    (v: Setter<S[K0][K1][K2][K3][K4][K5]>) => void,
  ];
  useLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
  >(
    path: [K0, K1, K2, K3, K4],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4],
      rhs: S[K0][K1][K2][K3][K4],
    ) => boolean,
  ): [S[K0][K1][K2][K3][K4], (v: Setter<S[K0][K1][K2][K3][K4]>) => void];
  useLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
  >(
    path: [K0, K1, K2, K3],
    equalF?: (lhs: S[K0][K1][K2][K3], rhs: S[K0][K1][K2][K3]) => boolean,
  ): [S[K0][K1][K2][K3], (v: Setter<S[K0][K1][K2][K3]>) => void];

  useLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
  >(
    path: [K0, K1, K2],
    equalF?: (lhs: S[K0][K1][K2], rhs: S[K0][K1][K2]) => boolean,
  ): [S[K0][K1][K2], (v: Setter<S[K0][K1][K2]>) => void];

  useLens<K0 extends keyof S = keyof S, K1 extends keyof S[K0] = keyof S[K0]>(
    path: [K0, K1],
    equalF?: (lhs: S[K0][K1], rhs: S[K0][K1]) => boolean,
  ): [S[K0][K1], (v: Setter<S[K0][K1]>) => void];

  useLens<K0 extends keyof S = keyof S>(
    path: [K0],
    equalF?: (lhs: S[K0], rhs: S[K0]) => boolean,
  ): [S[K0], (v: Setter<S[K0]>) => void];

  useLens<T, A, B>(
    lens: Lens<S, T, A, B>,
    equalF?: (lhs: A, rhs: A) => boolean,
  ): [A, (v: Setter<A>) => void];

  // useSetLens
  useSetLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
    K5 extends keyof S[K0][K1][K2][K3][K4] = keyof S[K0][K1][K2][K3][K4],
  >(
    path: [K0, K1, K2, K3, K4, K5],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4][K5],
      rhs: S[K0][K1][K2][K3][K4][K5],
    ) => boolean,
  ): (v: Setter<S[K0][K1][K2][K3][K4][K5]>) => void;

  useSetLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
  >(
    path: [K0, K1, K2, K3, K4],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4],
      rhs: S[K0][K1][K2][K3][K4],
    ) => boolean,
  ): (v: Setter<S[K0][K1][K2][K3][K4]>) => void;

  useSetLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
  >(
    path: [K0, K1, K2, K3],
    equalF?: (lhs: S[K0][K1][K2][K3], rhs: S[K0][K1][K2][K3]) => boolean,
  ): (v: Setter<S[K0][K1][K2][K3]>) => void;

  useSetLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
  >(
    path: [K0, K1, K2],
    equalF?: (lhs: S[K0][K1][K2], rhs: S[K0][K1][K2]) => boolean,
  ): (v: Setter<S[K0][K1][K2]>) => void;

  useSetLens<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
  >(
    path: [K0, K1],
    equalF?: (lhs: S[K0][K1], rhs: S[K0][K1]) => boolean,
  ): (v: Setter<S[K0][K1]>) => void;

  useSetLens<K0 extends keyof S = keyof S>(
    path: [K0],
    equalF?: (lhs: S[K0], rhs: S[K0]) => boolean,
  ): (v: Setter<S[K0]>) => void;

  useSetLens<T, A, B>(
    lens: Lens<S, T, A, B>,
    equalF?: (lhs: A, rhs: A) => boolean,
  ): (v: Setter<A>) => void;

  useLensV<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
    K5 extends keyof S[K0][K1][K2][K3][K4] = keyof S[K0][K1][K2][K3][K4],
  >(
    path: [K0, K1, K2, K3, K4, K5],
    initialValue: S[K0][K1][K2][K3][K4][K5],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4][K5],
      rhs: S[K0][K1][K2][K3][K4][K5],
    ) => boolean,
  ): [
    S[K0][K1][K2][K3][K4][K5],
    (v: Setter<S[K0][K1][K2][K3][K4][K5]>) => void,
  ];
  useLensV<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
    K4 extends keyof S[K0][K1][K2][K3] = keyof S[K0][K1][K2][K3],
  >(
    path: [K0, K1, K2, K3, K4],
    initialValue: S[K0][K1][K2][K3][K4],
    equalF?: (
      lhs: S[K0][K1][K2][K3][K4],
      rhs: S[K0][K1][K2][K3][K4],
    ) => boolean,
  ): [S[K0][K1][K2][K3][K4], (v: Setter<S[K0][K1][K2][K3][K4]>) => void];

  useLensV<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
    K3 extends keyof S[K0][K1][K2] = keyof S[K0][K1][K2],
  >(
    path: [K0, K1, K2, K3],
    initialValue: S[K0][K1][K2][K3],
    equalF?: (lhs: S[K0][K1][K2][K3], rhs: S[K0][K1][K2][K3]) => boolean,
  ): [S[K0][K1][K2][K3], (v: Setter<S[K0][K1][K2][K3]>) => void];

  useLensV<
    K0 extends keyof S = keyof S,
    K1 extends keyof S[K0] = keyof S[K0],
    K2 extends keyof S[K0][K1] = keyof S[K0][K1],
  >(
    path: [K0, K1, K2],
    initialValue: S[K0][K1][K2],
    equalF?: (lhs: S[K0][K1][K2], rhs: S[K0][K1][K2]) => boolean,
  ): [S[K0][K1][K2], (v: Setter<S[K0][K1][K2]>) => void];

  useLensV<K0 extends keyof S = keyof S, K1 extends keyof S[K0] = keyof S[K0]>(
    path: [K0, K1],
    initialValue: S[K0][K1],
    equalF?: (lhs: S[K0][K1], rhs: S[K0][K1]) => boolean,
  ): [S[K0][K1], (v: Setter<S[K0][K1]>) => void];

  useLensV<K0 extends keyof S = keyof S>(
    path: [K0],
    initialValue: S[K0],
    equalF?: (lhs: S[K0], rhs: S[K0]) => boolean,
  ): [S[K0], (v: Setter<S[K0]>) => void];

  useLensV<T, A, B>(
    lens: Lens<S, T, A, B>,
    initialValue: A,
    equalF?: (lhs: A, rhs: A) => boolean,
  ): [A, (v: Setter<A>) => void];
};
