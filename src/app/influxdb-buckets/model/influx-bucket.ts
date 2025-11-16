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
