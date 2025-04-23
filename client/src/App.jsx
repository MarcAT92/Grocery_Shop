import React, { useState, useEffect, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import ProductCategory from "./pages/ProductCategory";


// Lazy load route components
const Home = React.lazy(() => import("./pages/Home"));
const AllProduct = React.lazy(() => import("./pages/AllProduct"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));

const App = () => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const isSellerPath = location.pathname.includes("seller");
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
      {!isSellerPath && <Navbar />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { maxWidth: '500px' }
        }}
      />
      <main
        className={`${isSellerPath ? "" : "py-12 px-6 md-px16 lg-px-24 xl:px-32"
          } relative flex-grow min-h-[calc(100vh-200px)]`}
      >
        {isTransitioning ? (
          <Loader />
        ) : (
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<AllProduct />} />
              <Route path="/products/:category" element={<ProductCategory />} />
              <Route path="/products/:category/:id" element={<ProductDetails />} />
            </Routes>
          </Suspense>
        )}
      </main>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;
