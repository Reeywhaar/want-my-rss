export type Data = {
  title: string | null;
  url: string;
  type: string;
};

export type Return = {
  url: string;
  data: Data[];
};
