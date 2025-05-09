// Check if admin is logged in
export const isAdminLoggedIn = () => {
    try {
        const token = localStorage.getItem('adminToken');
        console.log('Checking admin login status');

        if (!token) return false;

        // Basic validation that token exists and has reasonable length
        // JWT tokens are typically much longer than 50 characters
        if (token.length < 10) {
            console.warn('Admin token appears invalid (too short)');
            localStorage.removeItem('adminToken'); // Clean up invalid token
            return false;
        }

        // Verify token format by checking for lastUpdated field
        try {
            // Decode the token (just the payload part)
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));

                // Check if token has basic required fields
                if (!payload.id || !payload.isAdmin) {
                    console.warn('Token missing required fields');
                    localStorage.removeItem('adminToken'); // Clean up invalid token
                    return false;
                }
            }
        } catch (e) {
            console.warn('Could not decode token for verification:', e);
            // Continue with basic validation if token parsing fails
        }

        return true;
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
    localStorage.removeItem('adminData');
};

// Get admin data
export const getAdminData = () => {
    const adminDataStr = localStorage.getItem('adminData');
    if (!adminDataStr) return null;

    try {
        return JSON.parse(adminDataStr);
    } catch (error) {
        console.error('Error parsing admin data:', error);
        return null;
    }
};

// Admin logout
export const adminLogout = async () => {
    try {
        // Call backend API for admin logout
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const token = getAdminToken();
        console.log('Logging out admin');

        if (token) {
            try {
                const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

                const response = await fetch(`${apiUrl}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': formattedToken
                    },
                    credentials: 'include'
                });

                console.log('Logout response status:', response.status);

                // Try to parse the response, but don't block on errors
                try {
                    const data = await response.json();
                    console.log('Logout response:', data);
                } catch (parseError) {
                    // Ignore JSON parsing errors
                }
            } catch (apiError) {
                console.error('API error during logout:', apiError);
                // Continue with logout process even if API call fails
            }
        }

        // Always remove the token from localStorage
        console.log('Removing admin token from localStorage');
        removeAdminToken();

        // Clear any related storage
        sessionStorage.removeItem('adminData');

        return true; // Consider logout successful if we removed the token
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove the token even if there's an error
        removeAdminToken();
        return true;
    }
};
