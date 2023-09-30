export type RSSDataItem = {
  id: string;
  title: string;
  date?: Date;
  url?: string;
  author?: string;
  content?: string;
  image?: string;
  media?: {
    type: string | "";
    url: string | "";
    name: string | "";
  };
};

export type RSSData = {
  title: string;
  feedUrl: string;
  image?: string;
  url?: string;
  description?: string;
  items: RSSDataItem[];
};
