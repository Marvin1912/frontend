export interface FileItemTime {
  value: number;
}

export interface FileItem {
  id: string;
  name: string;
  size?: number;
  modifiedTime?: FileItemTime;
  webViewLink?: string;
}

export interface FileListResponse {
  files: FileItem[];
  success: boolean;
  error?: string;
}