export interface InfluxBucket {
  name: string;
  bucketName: string;
  description: string;
}

export interface InfluxExportRequest {
  buckets: string[];
  startTime?: string;
  endTime?: string;
}

export interface InfluxExportResponse {
  success: boolean;
  message: string;
  data?: any;
}