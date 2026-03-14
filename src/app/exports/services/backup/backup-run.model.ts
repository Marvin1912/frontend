export interface BackupRun {
  id: number;
  fileName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  uploadSuccess: boolean | null;
  errorMessage: string | null;
}

export interface BackupRunPage {
  content: BackupRun[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
