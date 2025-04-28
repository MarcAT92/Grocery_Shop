import React, { useState, useEffect, Suspense } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ProductCategory from "./pages/ProductCategory";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import { useAppContext } from "./context/AppContext";

// Lazy load route components
const Home = React.lazy(() => import("./pages/Home"));
const AllProduct = React.lazy(() => import("./pages/AllProduct"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));

// Assume these admin components exist
const AddProducts = React.lazy(() => import("./pages/admin/AddProducts"));
const ProductList = React.lazy(() => import("./pages/admin/ProductList"));
const Orders = React.lazy(() => import("./pages/admin/Orders"));

const App = () => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { isAdmin } = useAppContext();
  const isAdminPath = location.pathname.startsWith("/admin");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    let timeoutId;
    const handleTransition = () => {
      setIsTransitioning(true);
      timeoutId = setTimeout(() => setIsTransitioning(false), 400);
    };

    handleTransition();

    return () => timeoutId && clearTimeout(timeoutId);
  }, [location.pathname, isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
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

      {/* Use Routes component to handle all routing logic */}
      <Routes>
        {/* Public Routes Wrapper */}
        <Route path="/*" element={
          !isAdminPath ? (
            <>
              <main className="py-12 px-6 md:px-16 lg:px-24 xl:px-32 relative flex-grow min-h-[calc(100vh-200px)]">
                {isTransitioning ? (
                  <Loader />
                ) : (
                  <Suspense fallback={<Loader />}>
                    {/* Nested Routes for public pages */}
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<AllProduct />} />
                      <Route path="/products/:category" element={<ProductCategory />} />
                      <Route path="/products/:category/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/add-address" element={<AddAddress />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                )}
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
            <AdminLayout> {/* AdminLayout wraps the admin content */}
              <Suspense fallback={<Loader />}> {/* Suspense for lazy admin components */}
                <Routes> {/* Nested Routes for admin pages */}
                  <Route path="/" element={<AddProducts />} /> {/* Index relative to /admin */}
                  <Route path="/product-list" element={<ProductList />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} /> {/* Catch all for admin */}
                </Routes>
              </Suspense>
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace /> /* Redirect if not admin */
          )
        } />

      </Routes>
    </div>
  );
};

export default App;
