# Grocery Shop Server

This is the backend server for the Grocery Shop application.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI="your_mongodb_connection_string"
CLERK_SECRET_KEY="your_clerk_secret_key"

# Admin credentials (used to create initial admin user)
ADMIN_NAME="Admin User"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
JWT_SECRET="your_jwt_secret_key"
```

## Running the Server

### Development Mode (with auto-restart)

```
npm run server
```

This uses nodemon to automatically restart the server when files change.

### Production Mode

```
npm start
```

This runs the server without nodemon.

## API Endpoints

### User Routes

- `POST /api/users/sync` - Sync user data from Clerk
- `GET /api/users/me` - Get current user profile (protected route)

### Admin Routes

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile (protected route)

## Authentication

### User Authentication

This server integrates with Clerk for user authentication. When a user signs in with Clerk on the frontend, their data is synced to MongoDB through the `/api/users/sync` endpoint.

Protected user routes use the `verifyAuth` middleware to verify the Clerk token and load the user from MongoDB.

### Admin Authentication

Admin authentication is handled by the backend using JWT tokens. When the server starts, it automatically creates an initial admin user if none exists, using the credentials specified in the `.env` file.

Protected admin routes use the `protectAdmin` middleware to verify the JWT token and load the admin from MongoDB.

## Admin User Management

The server includes several scripts to manage admin users:

### Creating Admin Users

```
npm run admin:create
```

This interactive script will prompt you for the admin's name, email, and password.

### Listing Admin Users

```
npm run admin:list
```

This script will display a list of all admin users in the database.

### Deleting Admin Users

```
npm run admin:delete
```

This interactive script will display a list of admin users and allow you to select one to delete. Note that you cannot delete the last remaining admin user.
