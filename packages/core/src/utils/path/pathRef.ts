import { type MutableRefObject } from 'react';

export type PathRef = MutableRefObject<() => string[]>;
