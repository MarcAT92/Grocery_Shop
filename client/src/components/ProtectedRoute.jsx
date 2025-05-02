import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    // Return a loading state if auth is still loading
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    // User is not signed in, show sign-in prompt
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-medium text-blue-800 mb-3">Sign in Required</h2>
          <p className="text-blue-700 mb-6">You need to sign in to access this page.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dull transition-colors font-medium">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // User is signed in, render the protected content
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
