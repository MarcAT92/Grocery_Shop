# Grocery Shop Client

This is the frontend client for the Grocery Shop application built with React and Vite.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the client directory with the following variables:

```
# API URL - URL of your backend server
VITE_API_URL="http://localhost:4000/api"

# Clerk Authentication - Get these from your Clerk dashboard
VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# Currency symbol to use throughout the app (optional, defaults to $)
VITE_CURRENCY="$"
```

## Running the Client

### Development Mode

```
npm run dev
```

This starts the development server with hot module replacement.

### Build for Production

```
npm run build
```

This builds the app for production to the `dist` folder.

### Preview Production Build

```
npm run preview
```

This serves the production build locally for testing.

## Features

- User authentication with Clerk
- Product browsing and filtering
- Shopping cart functionality
- Address management
- Order placement and tracking
- Responsive design for mobile and desktop

## Environment Variables Explained

### Required Variables

- `VITE_API_URL`: The URL of your backend API server. This is used for all API requests.
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key for frontend authentication.

### Optional Variables

- `VITE_CURRENCY`: The currency symbol to use throughout the app. Defaults to "$" if not provided.

## Authentication

This client uses Clerk for authentication. Users can sign up, sign in, and manage their profiles through Clerk's interface.

When a user signs in, their Clerk token is used to authenticate API requests to the backend server.

## Folder Structure

- `src/assets`: Static assets like images and icons
- `src/components`: Reusable UI components
- `src/context`: React context providers
- `src/data`: Static data files
- `src/pages`: Page components
- `src/utils`: Utility functions

## Integration with Backend

The client communicates with the backend server through RESTful API endpoints. The base URL for these endpoints is specified in the `VITE_API_URL` environment variable.

All authenticated requests include the Clerk token in the Authorization header.
