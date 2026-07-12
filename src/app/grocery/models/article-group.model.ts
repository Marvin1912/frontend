export interface Article {
  id: number;
  name: string;
  normalizedName: string;
  groupId: number | null;
  groupName: string | null;
  purchaseCount: number;
}

export interface ArticleGroup {
  id: number;
  name: string;
}
