export interface Article {
  id: number;
  title: string;
  description: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  fetchedAt: string;
  isRead: boolean;
}

export interface ArticlePage {
  content: Article[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface FeedSource {
  id?: number;
  name: string;
  url: string;
  category: string;
  active?: boolean;
}
