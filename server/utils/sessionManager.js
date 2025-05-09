// Session manager for tracking and invalidating admin sessions
import { logger } from './logger.js';

// Store for active admin sessions
// Key: admin ID, Value: { lastUpdated: timestamp }
const activeSessions = new Map();

// Add or update an admin session
export const trackAdminSession = (adminId, token) => {
    const adminIdStr = adminId.toString();

    // Check if there's a force logout flag before creating a new session
    const existingSession = activeSessions.get(adminIdStr);
    const forceLogout = existingSession?.forceLogout || false;

    // Create or update the session
    activeSessions.set(adminIdStr, {
        lastUpdated: Date.now(),
        token,
        forceLogout // Preserve force logout flag if it exists
    });

    logger.debug('SessionManager', `Admin session tracked: ${adminId} (forceLogout: ${forceLogout})`);

    // Return whether this admin should be forced to logout
    return forceLogout;
};

// Remove an admin session
export const removeAdminSession = (adminId) => {
    if (adminId && activeSessions.has(adminId.toString())) {
        activeSessions.delete(adminId.toString());
        logger.debug('SessionManager', `Admin session removed: ${adminId}`);
        return true;
    }
    return false;
};

// Check if an admin session is valid
export const isSessionValid = (adminId, lastUpdatedTime) => {
    const adminIdStr = adminId.toString();
    if (!activeSessions.has(adminIdStr)) {
        return true; // No tracked session, so consider valid
    }

    const session = activeSessions.get(adminIdStr);
    return session.lastUpdated <= lastUpdatedTime;
};

// Force logout for a specific admin
export const forceLogoutAdmin = (adminId) => {
    const adminIdStr = adminId.toString();

    // Always set the force logout flag, even if no active session
    // This ensures admins will be logged out even if they log in later
    if (activeSessions.has(adminIdStr)) {
        logger.info('SessionManager', `Forcing logout for active admin session: ${adminId}`);
        activeSessions.set(adminIdStr, {
            ...activeSessions.get(adminIdStr),
            forceLogout: true,
            logoutTime: Date.now()
        });
        return true;
    } else {
        // Create a new session entry with force logout flag
        logger.info('SessionManager', `Creating force logout entry for admin: ${adminId}`);
        activeSessions.set(adminIdStr, {
            lastUpdated: Date.now(),
            forceLogout: true,
            logoutTime: Date.now()
        });
        return false; // Return false as there was no active session
    }
};

// Check if admin should be forced to logout
export const shouldForceLogout = (adminId) => {
    if (!adminId) return false;

    const adminIdStr = adminId.toString();
    if (activeSessions.has(adminIdStr)) {
        const session = activeSessions.get(adminIdStr);
        const result = session.forceLogout === true;
        logger.debug('SessionManager', `Checking force logout for admin ${adminId}: ${result}`);
        return result;
    }

    logger.debug('SessionManager', `No session found for admin ${adminId} when checking force logout`);
    return false;
};

// Clear force logout flag after successful logout
export const clearForceLogout = (adminId) => {
    const adminIdStr = adminId.toString();
    if (activeSessions.has(adminIdStr)) {
        const session = activeSessions.get(adminIdStr);
        if (session.forceLogout) {
            activeSessions.set(adminIdStr, {
                ...session,
                forceLogout: false
            });
            logger.debug('SessionManager', `Cleared force logout for admin: ${adminId}`);
        }
    }
};

// Get all active admin sessions
export const getActiveSessions = () => {
    return Array.from(activeSessions.entries()).map(([adminId, session]) => ({
        adminId,
        lastUpdated: new Date(session.lastUpdated),
        forceLogout: !!session.forceLogout
    }));
};
