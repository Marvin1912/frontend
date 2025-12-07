# Delete File API Specification

## Endpoint Details

- **Method**: `DELETE`
- **Path**: `/files/{fileId}`
- **Base URL**: `http://192.168.178.29:9001`
- **Full URL**: `http://192.168.178.29:9001/files/{fileId}`
- **Tags**: File List

## Description

Deletes a specific file from Google Drive using its file ID. This operation is permanent and cannot be undone.

## Parameters

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fileId` | string | Yes | The ID of the file to delete from Google Drive |

## Responses

### 200 OK - Success
**Description**: File successfully deleted from Google Drive
**Content-Type**: `application/json`
**Schema**: [FileDeleteResponse](#filedeleteresponse-schema)

### 400 Bad Request
**Description**: Bad request - invalid file ID provided
**Content-Type**: `application/json`
**Schema**: [FileDeleteResponse](#filedeleteresponse-schema)

### 404 Not Found
**Description**: File not found in Google Drive
**Content-Type**: `application/json`
**Schema**: [FileDeleteResponse](#filedeleteresponse-schema)

### 500 Internal Server Error
**Description**: Internal server error occurred while deleting file from Google Drive
**Content-Type**: `application/json`
**Schema**: [FileDeleteResponse](#filedeleteresponse-schema)

## Schemas

### FileDeleteResponse Schema

```json
{
  "success": "boolean",
  "message": "string",
  "error": "string",
  "timestamp": "string (date-time)"
}
```

#### Properties

| Name | Type | Description |
|------|------|-------------|
| `success` | boolean | Indicates whether the deletion was successful |
| `message` | string | Descriptive message about the operation result |
| `error` | string | Error details (if applicable) |
| `timestamp` | string | ISO 8601 timestamp of when the operation was performed |

## Example Usage

### Request

```http
DELETE /files/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms HTTP/1.1
Host: 192.168.178.29:9001
```

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "File successfully deleted from Google Drive",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "File not found in Google Drive",
  "error": "File with ID 'invalid-file-id' does not exist",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Related Endpoints

- `GET /files/list` - List files in Google Drive (to get file IDs)
- See also: [File List API Documentation](#) for retrieving file IDs that can be used with this delete endpoint

## Notes

- This operation is **permanent** and cannot be undone
- File IDs can be obtained from the `/files/list` endpoint
- The endpoint requires proper authentication with Google Drive API permissions