import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const ClerkIntegration = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // Function to sync user data with backend
  const syncUserWithBackend = async () => {
    try {
      if (!isSignedIn || !user) return;

      // Get token from Clerk
      const token = await getToken();

      // Prepare user data
      const userData = {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl
      };

      // Send data to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('User synced with backend:', data.user);
      } else {
        console.error('Failed to sync user with backend:', data.message);
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  // Sync user data when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserWithBackend();
    }
  }, [isSignedIn, user?.id]);

  // This component doesn't render anything
  return null;
};

export default ClerkIntegration;
