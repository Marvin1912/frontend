export interface InfluxBucketResponse {
  buckets: InfluxBucket[];
  message: string;
  success: boolean;
}

export interface InfluxBucket {
  name: string;
  bucketName: string;
  description: string;
}

export interface InfluxExportRequest {
  bucket?: string;
  startTime?: string;
  endTime?: string;
}

export interface InfluxExportResponse {
  success: boolean;
  message: string;
  exportedFiles: string[];
  timestamp: string;
  error?: string;
}

export interface ExportHistory {
  id: string;
  name: string;
  type: 'InfluxDB' | 'Other';
  timestamp: Date;
  status: 'completed' | 'failed' | 'pending';
  fileCount: number;
}

export interface ExportHistoryResponse {
  exports: ExportHistory[];
  message: string;
  success: boolean;
}
