export interface Article {
  id: string;
  name: string;
  normalizedName: string;
  groupId: string | null;
  groupName: string | null;
  purchaseCount: number;
}

export interface ArticleGroup {
  id: string;
  name: string;
}
