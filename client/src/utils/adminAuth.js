// Check if admin is logged in
export const isAdminLoggedIn = () => {
    return localStorage.getItem('adminToken') !== null;
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
        await fetch(`${apiUrl}/admin/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAdminToken()}`
            },
            credentials: 'include'
        });

        // Remove token from localStorage
        removeAdminToken();

        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
};
