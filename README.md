# Grocery Shop

A full-stack e-commerce application for a grocery shop with user authentication, product management, shopping cart, and order processing.


## 📋 Overview

Grocery Shop is a modern e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a responsive design, user authentication with Clerk, admin dashboard, product management, shopping cart functionality, and order processing.

### 🌟 Features

- **User Authentication**: Secure login and registration with Clerk
- **Product Browsing**: Browse products by category with search and filter options
- **Shopping Cart**: Add, update, and remove items from cart
- **Address Management**: Save and manage multiple delivery addresses
- **Order Processing**: Place orders and track order status
- **Admin Dashboard**: Manage products, orders, and inventory
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Clerk account for authentication
- Cloudinary account for image storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/grocery-shop.git
cd grocery-shop
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:

Create `.env` files in both the client and server directories. See the respective README files for details on required environment variables:
- [Client Environment Variables](./client/README.md#environment-variables-explained)
- [Server Environment Variables](./server/README.md#environment-variables-explained)

4. Start the development servers:

```bash
# Start the server (from the server directory)
npm run dev

# Start the client (from the client directory)
npm run dev
```

## 👨‍💼 Admin Management

The application includes several scripts for managing admin users:

### Creating Admin Users

```bash
# From the server directory
npm run admin:create
```

This interactive script will prompt you for the admin's name, email, and password.

### Listing Admin Users

```bash
# From the server directory
npm run admin:list
```

This script will display a list of all admin users in the database.

### Editing Admin Users

```bash
# From the server directory
npm run admin:edit
```

This interactive script will display a list of admin users and allow you to select one to edit. You can update the admin's name, email, and password.

### Deleting Admin Users

```bash
# From the server directory
npm run admin:delete
```

This interactive script will display a list of admin users and allow you to select one to delete.

## 🏗️ Project Structure

```
grocery-shop/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   ├── src/                # Source files
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── data/           # Static data files
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   └── README.md           # Client documentation
├── server/                 # Backend Node.js/Express application
│   ├── configs/            # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── README.md           # Server documentation
└── README.md               # Main documentation (this file)
```

## 🔧 Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Clerk Authentication
- React Hot Toast

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for admin authentication
- Clerk SDK
- Cloudinary for image storage


## 📖 Documentation

For more detailed documentation, please refer to:
- [Client Documentation](./client/README.md)
- [Server Documentation](./server/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Porfolio - [https://marcathomas.netlify.app/]

Project Link: [https://github.com/MarcAT92/Grocery_Shop]
