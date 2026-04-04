export interface Disposable {
  dispose(): void;
}

export class DisposableStack {
  private isDisposed = false;
  private disposables: Disposable[] = [];

  get disposed() {
    return this.isDisposed;
  }

  adopt<T>(value: T, dispose: (value: T) => void): T {
    this.disposables.push({ dispose: () => dispose(value) });
    return value;
  }

  use<T extends Disposable>(value: T): T {
    this.disposables.push(value);
    return value;
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
    this.isDisposed = true;
  }

  defer(cb: () => void) {
    const res = cb();
    this.disposables.push({ dispose: () => res });
  }
}
