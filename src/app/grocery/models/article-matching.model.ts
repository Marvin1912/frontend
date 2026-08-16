export interface ArticleGroupSuggestion {
  id: number;
  articleId: number;
  articleName: string;
  articleNormalizedName: string;
  suggestedGroupId: number;
  suggestedGroupName: string;
  score: number;
  source: 'HEURISTIC' | 'LLM';
}

export interface MatchingRunResult {
  candidatesEvaluated: number;
  autoAssigned: number;
  suggested: number;
  unmatched: number;
}
