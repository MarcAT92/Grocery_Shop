# Grocery Shop Server

This is the backend server for the Grocery Shop application.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```
# Required Variables
# MongoDB Connection String
MONGODB_URI="mongodb://localhost:27017/grocery_shop"

# Clerk Authentication
CLERK_SECRET_KEY="your_clerk_secret_key"

# JWT Secret for Admin Authentication
JWT_SECRET="your_jwt_secret_key"

# Optional Variables
# Server Port (defaults to 4000)
PORT=4000

# Cloudinary Configuration for Image Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Admin Credentials (used for initial setup)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure_password"
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

### Cart Routes

- `POST /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Product Routes

**Public Routes:**
- `GET /api/product/list` - Get all products (with optional filtering)
- `POST /api/product/id` - Get product by ID

**Admin Routes:**
- `POST /api/product/add` - Add a new product (protected)
- `PUT /api/product/update` - Update a product (protected)
- `POST /api/product/stock` - Update product stock status (protected)
- `DELETE /api/product/delete` - Delete a product (protected)

### Address Routes

**All routes are protected and require authentication:**
- `POST /api/address/add` - Add a new address
- `POST /api/address/list` - Get all addresses for a user
- `PUT /api/address/update` - Update an address
- `DELETE /api/address/delete` - Delete an address
- `PUT /api/address/set-default` - Set an address as default
- `POST /api/address/default` - Get the default address for a user

### Order Routes

**All routes are protected and require authentication:**
- `POST /api/orders/create` - Create a new order using cart items and shipping address

## Environment Variables Explained

### Required Variables

- `MONGODB_URI`: Connection string for your MongoDB database. This can be a local MongoDB instance or a MongoDB Atlas cluster.
  - Example local: `mongodb://localhost:27017/grocery_shop`
  - Example Atlas: `mongodb+srv://username:password@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority`

- `CLERK_SECRET_KEY`: Your Clerk secret key for backend authentication verification. This is used to verify the JWT tokens issued by Clerk.
  - Get this from your Clerk dashboard under API Keys.

- `JWT_SECRET`: Secret key used for signing and verifying JWT tokens for admin authentication.
  - This should be a long, random string. You can generate one using a tool like [randomkeygen.com](https://randomkeygen.com/).

### Cloudinary Variables (Required for Image Upload)

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Your Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.
  - Get these from your Cloudinary dashboard under Account Details.

### Optional Variables

- `PORT`: The port on which the server will run. Defaults to 4000 if not provided.

- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: These are used for the initial admin account setup. If provided, the system will create an admin user with these credentials when it first starts up if no admin users exist in the database.

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

### Editing Admin Users

```
npm run admin:edit
```

This interactive script will display a list of admin users and allow you to select one to edit. You can update the admin's name, email, and password. Leave any field empty to keep the current value.
