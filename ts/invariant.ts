export const invariant = (err: Error | string) => {
  throw err instanceof Error ? err : new Error(err);
};
