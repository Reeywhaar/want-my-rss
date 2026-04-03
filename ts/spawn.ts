export const spawn = (cb: (stack: DisposableStack) => unknown) => {
  const stack = new DisposableStack();
  try {
    const res = cb(stack);
    if (res instanceof Promise) {
      return res.finally(() => stack.dispose());
    }
    return stack;
  } catch (e) {
    stack.dispose();
    throw e;
  }
};
