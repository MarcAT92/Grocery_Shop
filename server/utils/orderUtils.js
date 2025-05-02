/**
 * Generates a unique order number
 * Format: ORD-YYYYMMDD-XXXX where:
 * - ORD is a prefix
 * - YYYYMMDD is the current date
 * - XXXX is a random alphanumeric string
 * @returns {string} A unique order number
 */
export const generateOrderNumber = () => {
    // Get current date in YYYYMMDD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Generate a random alphanumeric string of length 4
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
        randomStr += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Combine all parts to create the order number
    return `ORD-${dateStr}-${randomStr}`;
};
