export interface Flashcard {
  id: number | null;
  deck: string;
  ankiId: string | null;
  front: string;
  back: string;
  description: string;
  updated: boolean;
}
