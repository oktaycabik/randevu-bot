require('dotenv').config();

module.exports = {
    app: {
        port: process.env.PORT || 3001,
        environment: process.env.NODE_ENV || 'development'
    },
    appointment: {
        url: process.env.APPOINTMENT_URL || 'http://localhost:3001/demo',
        checkInterval: parseInt(process.env.CHECK_INTERVAL) || 5000,
        maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
        timeout: parseInt(process.env.TIMEOUT) || 30000
    },
    browser: {
        visible: process.env.BROWSER_VISIBLE === 'true',
        userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    form: {
        selectors: {
            firstName: 'input#firstName',
            lastName: 'input#lastName',
            identityNumber: 'input#identityNumber',
            phone: 'input#phone',
            email: 'input#email',
            submitButton: 'button[type="submit"]'
        },
        validation: {
            identityNumberLength: 11,
            phoneMinLength: 10
        }
    },
    userData: {
        firstName: process.env.FIRST_NAME || 'John',
        lastName: process.env.LAST_NAME || 'Doe',
        identityNumber: process.env.IDENTITY_NUMBER || '12345678901',
        phone: process.env.PHONE || '5551234567',
        email: process.env.EMAIL || 'john.doe@example.com'
    }
}; 