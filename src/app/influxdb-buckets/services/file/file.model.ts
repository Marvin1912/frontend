export interface FileItem {
  id: string;
  name: string;
  size?: number;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface FileListResponse {
  files: FileItem[];
  success: boolean;
  error?: string;
}