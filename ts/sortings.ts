export type Sorting = "none" | "date desc" | "date asc";

export const Sortings: Sorting[] = ["none", "date desc", "date asc"];

export type SortingObject = {
  label: string;
  fn: (a: HTMLElement, b: HTMLElement) => -1 | 0 | 1;
};

export const SortingObjects: { [P in Sorting]: SortingObject } = {
  none: {
    label: "None",
    fn: (a, b) => {
      try {
        const pa = parseInt(a.dataset.index!, 10);
        const pb = parseInt(b.dataset.index!, 10);
        if (pa == pb) return 0;
        return pa < pb ? -1 : 1;
      } catch (e) {
        return 0;
      }
    },
  },
  "date desc": {
    label: "Newest",
    fn: (a, b) => {
      try {
        const pa = parseInt(a.dataset.datetime!, 10);
        const pb = parseInt(b.dataset.datetime!, 10);
        if (pa == pb) return 0;
        return pa < pb ? 1 : -1;
      } catch (e) {
        return 0;
      }
    },
  },
  "date asc": {
    label: "Oldest",
    fn: (a, b) => (SortingObjects["date desc"].fn(a, b) * -1) as -1 | 0 | 1,
  },
};
