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
