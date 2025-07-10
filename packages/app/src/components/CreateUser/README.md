# User Creation Implementation

This document describes the complete user creation implementation for QortexOne.

## Overview

The user creation system consists of:
1. **Frontend**: A React component with form validation and error handling
2. **Backend**: A REST API with user management and catalog integration
3. **Catalog Integration**: Users created through the form appear in the Backstage catalog

## Features

### Frontend (CreateUserPage.tsx)
- ✅ **Form Validation**: Client-side validation for all fields
- ✅ **Error Handling**: Displays validation errors and API errors
- ✅ **Loading States**: Shows loading spinner during submission
- ✅ **Success Feedback**: Success notifications via snackbar
- ✅ **Form Reset**: Clears form after successful submission
- ✅ **Real-time Validation**: Clears errors as user types

### Backend (users.ts)
- ✅ **REST API**: Full CRUD operations for users
- ✅ **Validation**: Server-side validation using Zod
- ✅ **Duplicate Prevention**: Checks for existing usernames and emails
- ✅ **Catalog Integration**: Automatically registers users in Backstage catalog
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Logging**: Detailed logging for debugging

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users/:name` | Get a specific user |
| `PUT` | `/api/users/:name` | Update a user |
| `DELETE` | `/api/users/:name` | Delete a user |

### User Schema

```typescript
interface User {
  name: string;           // Username (required, max 50 chars, alphanumeric + _-)
  displayName: string;    // Full name (required, max 100 chars)
  email: string;          // Email address (required, valid format)
  memberOf?: string;      // Group membership (optional)
}
```

## Validation Rules

### Username
- Required
- Maximum 50 characters
- Only letters, numbers, hyphens, and underscores allowed
- Must be unique

### Display Name
- Required
- Maximum 100 characters
- Can contain any characters

### Email
- Required
- Must be a valid email format
- Must be unique

### Member Of (Group)
- Optional
- References an existing group in the catalog

## Catalog Integration

When a user is created:
1. User data is stored in the backend
2. A catalog entity is automatically created
3. User appears in the Backstage catalog under "Users"
4. User can be viewed and managed through the catalog interface

### Catalog Entity Structure

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: <username>
  annotations:
    backstage.io/managed-by-location: users-plugin
spec:
  profile:
    displayName: <displayName>
    email: <email>
  memberOf: [<group>]  # if specified
```

## Configuration

### app-config.yaml
The catalog section in `app-config.yaml` is already configured to handle users:

```yaml
catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, User, Group]
  locations:
    - type: file
      target: ../../examples/org.yaml
      rules:
        - allow: [User, Group]
```

### examples/org.yaml
Contains existing users and groups that serve as examples and templates.

## Usage

### Creating a User
1. Navigate to the "Create User" page via sidebar
2. Fill in the required fields:
   - Username (unique identifier)
   - Display Name (full name)
   - Email (valid email address)
   - Member Of (optional group)
3. Click "Create User"
4. User will be created and appear in the catalog

### Viewing Users
- Users appear in the main catalog under "Users"
- Click on a user to view their profile
- Users can be managed through the catalog interface

## Error Handling

### Frontend Errors
- **Validation Errors**: Displayed inline with form fields
- **API Errors**: Shown in snackbar notifications
- **Network Errors**: Graceful fallback with user-friendly messages

### Backend Errors
- **400 Bad Request**: Validation errors with detailed field information
- **409 Conflict**: Username or email already exists
- **404 Not Found**: User not found (for update/delete operations)
- **500 Internal Server Error**: Server errors with logging

## Security Considerations

### Current Implementation
- Input validation on both frontend and backend
- No sensitive data exposure in error messages
- Proper HTTP status codes

### Production Recommendations
- Add authentication/authorization
- Use a proper database instead of in-memory storage
- Add rate limiting
- Implement audit logging
- Add CSRF protection
- Use HTTPS in production

## Development

### Running the Application
1. Install dependencies: `yarn install`
2. Start the backend: `cd packages/backend && yarn start`
3. Start the frontend: `cd packages/app && yarn start`
4. Access the application at `http://localhost:3000`

### Testing the API
```bash
# Create a user
curl -X POST http://localhost:7007/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "displayName": "Test User",
    "email": "test@example.com",
    "memberOf": "devops"
  }'

# List all users
curl http://localhost:7007/api/users

# Get a specific user
curl http://localhost:7007/api/users/testuser
```

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **User Authentication**: Integrate with auth providers
3. **Role Management**: Add role-based access control
4. **Bulk Operations**: Import/export users
5. **User Profiles**: Rich profile pages with avatars
6. **Group Management**: Create and manage groups through UI
7. **Audit Trail**: Track user creation/modification history 