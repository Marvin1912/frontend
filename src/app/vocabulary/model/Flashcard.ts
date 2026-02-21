export interface Flashcard {
  id: number | null;
  deckId: number;
  ankiId: string | null;
  front: string;
  back: string;
  description: string;
  updated: boolean;
}
