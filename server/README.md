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

# JWT Secret for admin authentication
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

## Authentication

### User Authentication

This server integrates with Clerk for user authentication. When a user signs in with Clerk on the frontend, their data is synced to MongoDB through the `/api/users/sync` endpoint.

Protected user routes use the `verifyAuth` middleware to verify the Clerk token and load the user from MongoDB.

### Admin Authentication

Admin authentication is handled by the backend using JWT tokens. Admin users are created using the admin management scripts (see below).

The system includes a `protectAdmin` middleware that can be used to protect admin routes by verifying the JWT token and loading the admin from MongoDB, though it's not currently used in any routes.

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
