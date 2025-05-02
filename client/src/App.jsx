import React, { Suspense, lazy } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCategory from "./pages/ProductCategory";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import { useAppContext } from "./context/AppContext";
import ClerkIntegration from "./components/ClerkIntegration";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load route components
const Home = React.lazy(() => import("./pages/Home"));
const AllProduct = React.lazy(() => import("./pages/AllProduct"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

// Assume these admin components exist
const AddProducts = React.lazy(() => import("./pages/admin/AddProducts"));
const ProductList = React.lazy(() => import("./pages/admin/ProductList"));
const EditProduct = React.lazy(() => import("./pages/admin/EditProduct"));
const Orders = React.lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetails = React.lazy(() => import("./pages/admin/AdminOrderDetails"));

const App = () => {
  const location = useLocation();
  const { isLoaded } = useAuth(); // Only using isLoaded
  const { isAdmin } = useAppContext();
  const isAdminPath = location.pathname.startsWith("/admin");


  // No transition effect needed

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        {!isAdminPath && <Navbar />}
        <main className="py-12 px-6 md:px-16 lg:px-24 xl:px-32 relative flex-grow min-h-[calc(100vh-200px)]">
          {/* Loader removed */}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Render Navbar OR skip based on path */}
      {!isAdminPath && <Navbar />}

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { maxWidth: '500px' }
        }}
      />

      {/* Clerk Integration Component */}
      <ClerkIntegration />

      {/* No transition overlay */}

      {/* Use Routes component to handle all routing logic */}
      <Routes>
        {/* Public Routes Wrapper */}
        <Route path="/*" element={
          !isAdminPath ? (
            <>
              <main className="py-12 px-6 md:px-16 lg:px-24 xl:px-32 relative flex-grow min-h-[calc(100vh-200px)]">
                <Suspense fallback={<div className="min-h-[60vh]"></div>}>
                  {/* Nested Routes for public pages */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<AllProduct />} />
                    <Route path="/products/:category" element={<ProductCategory />} />
                    <Route path="/products/:category/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/add-address" element={<ProtectedRoute><AddAddress /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                    <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </>
          ) : <Navigate to="/admin" replace />
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={!isAdmin ? <AdminLogin /> : <Navigate to="/admin" replace />} />

        {/* Protected Admin Area */}
        <Route path="/admin/*" element={
          isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }>
          <Route index element={<AddProducts />} />
          <Route path="product-list" element={<ProductList />} />
          <Route path="edit-product" element={<EditProduct />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
