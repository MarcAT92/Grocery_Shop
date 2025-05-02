// Check if admin is logged in
export const isAdminLoggedIn = () => {
    try {
        const token = localStorage.getItem('adminToken');
        console.log('Checking admin login status, token:', token);

        if (!token) return false;

        // Basic validation that token exists and has reasonable length
        return token.length > 10;
    } catch (error) {
        console.error('Error validating admin token:', error);
        return false;
    }
};

// Get admin token
export const getAdminToken = () => {
    return localStorage.getItem('adminToken');
};

// Set admin token
export const setAdminToken = (token) => {
    localStorage.setItem('adminToken', token);
};

// Remove admin token
export const removeAdminToken = () => {
    localStorage.removeItem('adminToken');
};

// Admin logout
export const adminLogout = async () => {
    try {
        // Call backend API for admin logout
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const token = getAdminToken();
        console.log('Logging out admin with token:', token);

        if (token) {
            try {
                const response = await fetch(`${apiUrl}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token // Send token directly without Bearer prefix
                    },
                    credentials: 'include'
                });

                console.log('Logout response status:', response.status);
            } catch (apiError) {
                console.error('API error during logout:', apiError);
                // Continue with logout process even if API call fails
            }
        }

        // Always remove the token from localStorage
        console.log('Removing admin token from localStorage');
        removeAdminToken();
        return true; // Consider logout successful if we removed the token
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove the token even if there's an error
        removeAdminToken();
        return true;
    }
};
