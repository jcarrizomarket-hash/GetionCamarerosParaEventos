# Error Types and Response Codes

## 1. Authentication Errors
- **401 Unauthorized**: The request requires user authentication. 
- **403 Forbidden**: The server understood the request, but it refuses to authorize it.

## 2. Client Errors
- **400 Bad Request**: The server could not understand the request due to invalid syntax.
- **404 Not Found**: The server can not find the requested resource.

## 3. Server Errors
- **500 Internal Server Error**: The server has encountered a situation it doesn't know how to handle.
- **503 Service Unavailable**: The server is not ready to handle the request (server is down or overloaded).

## 4. Validation Errors
- **422 Unprocessable Entity**: The request was well-formed but was unable to be followed due to semantic errors.

## 5. Timeout Errors
- **408 Request Timeout**: The server did not receive a complete request message within the time that it was prepared to wait.

## Summary
Understanding error types and response codes is crucial for debugging and handling issues or unexpected situations in your application.