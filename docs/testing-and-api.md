# Testing and API Documentation

## Testing Setup

The project uses Jest and Supertest for testing the API endpoints. Tests are organized by route category:

- `test/analyticsRoutes.test.js` - Tests for analytics endpoints
- `test/authRoutes.test.js` - Tests for authentication endpoints
- `test/postRoutes.test.js` - Tests for post management endpoints
- `test/notificationRoutes.test.js` - Tests for notification endpoints

### Running Tests

To run the tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm test -- --coverage
```

### Test Structure

Each test file follows a similar structure:
1. Mock setup for dependencies (Firebase, Auth middleware, etc.)
2. Express app setup with routes
3. Test suites organized by endpoint
4. Tests for success and error cases

## API Documentation

The API is documented using Postman. The collection can be found in:
`postman/Social_Media_Scheduler_API.postman_collection.json`

### Importing the Collection

1. Open Postman
2. Click "Import" button
3. Select the `Social_Media_Scheduler_API.postman_collection.json` file
4. The collection will be imported with all endpoints and examples

### Collection Structure

The API documentation is organized into the following categories:

1. Authentication
   - Login
   - Register
   - OAuth endpoints

2. Posts
   - Create post
   - Get posts
   - Update post
   - Delete post
   - Schedule post
   - Publish post

3. Analytics
   - Get engagement metrics
   - Get platform stats
   - Get post analytics
   - Export analytics data

4. Notifications
   - Get notifications
   - Update notification settings

### Environment Variables

The collection uses the following environment variables:
- `baseUrl`: The base URL of the API (default: http://localhost:3000)
- `token`: The authentication token (set automatically after login)

### Using the Collection

1. Set up environment variables in Postman
2. Use the Login request to get an authentication token
3. The token will be automatically set for subsequent requests
4. Each request includes example payloads and response schemas

## Best Practices

1. Testing
   - Write tests for both success and error cases
   - Mock external dependencies
   - Use descriptive test names
   - Keep tests focused and isolated

2. API Documentation
   - Keep documentation up to date with code changes
   - Include example requests and responses
   - Document error cases and status codes
   - Use environment variables for flexibility

## Maintenance

### Updating Tests

When adding new endpoints or modifying existing ones:
1. Add corresponding test cases
2. Update mocks if needed
3. Run full test suite to ensure no regressions

### Updating API Documentation

When making API changes:
1. Update the Postman collection
2. Add new example requests/responses
3. Update environment variables if needed
4. Export and commit the updated collection
