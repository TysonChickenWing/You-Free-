// TypeScript 6's stricter side-effect-import check (TS2882) doesn't pick up
// Next.js's own ambient CSS module declarations in this version combo, so
// declare it ourselves.
declare module '*.css';
