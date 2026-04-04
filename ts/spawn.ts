import { DisposableStack } from "./disposable.js";

export const spawn = (cb: (stack: DisposableStack) => unknown) => {
  const stack = new DisposableStack();
  try {
    const res = cb(stack);
    if (res instanceof Promise) {
      res.catch((e) => {
        if (!stack.disposed) stack.dispose();
        throw e;
      });
    }
    return stack;
  } catch (e) {
    if (!stack.disposed) stack.dispose();
    throw e;
  }
};
