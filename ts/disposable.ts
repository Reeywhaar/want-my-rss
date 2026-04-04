export interface Disposable {
  dispose(): void;
}

export class DisposableStack {
  private disposables: Disposable[] = [];

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
  }
}
