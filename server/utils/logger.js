/**
 * Logger utility for consistent server logging
 */

// Format: [TIMESTAMP] [LEVEL] [SOURCE] - MESSAGE
const formatLog = (level, source, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${source}] - ${message}`;
};

// Log levels
export const logger = {
    info: (source, message) => {
        console.log(formatLog('INFO', source, message));
    },
    
    warn: (source, message) => {
        console.warn(formatLog('WARN', source, message));
    },
    
    error: (source, message, error) => {
        console.error(formatLog('ERROR', source, message));
        if (error) {
            console.error(error);
        }
    },
    
    debug: (source, message, data) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(formatLog('DEBUG', source, message));
            if (data) {
                console.log(data);
            }
        }
    },
    
    // Special method for admin actions
    admin: (adminId, adminEmail, action, details) => {
        const adminInfo = `Admin[${adminId}][${adminEmail}]`;
        console.log(formatLog('ADMIN', adminInfo, `${action} - ${details || ''}`));
    }
};
