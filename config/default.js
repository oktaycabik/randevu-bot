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
    users: [
        {
            firstName: process.env.FIRST_NAME_1 || 'Ahmet',
            lastName: process.env.LAST_NAME_1 || 'Yılmaz',
            identityNumber: process.env.IDENTITY_NUMBER_1 || '12345678901',
            phone: process.env.PHONE_1 || '5551234567',
            email: process.env.EMAIL_1 || 'ahmet.yilmaz@example.com',
            priority: 1
        },
        {
            firstName: process.env.FIRST_NAME_2 || 'Ayşe',
            lastName: process.env.LAST_NAME_2 || 'Demir',
            identityNumber: process.env.IDENTITY_NUMBER_2 || '98765432109',
            phone: process.env.PHONE_2 || '5559876543',
            email: process.env.EMAIL_2 || 'ayse.demir@example.com',
            priority: 2
        },
        {
            firstName: process.env.FIRST_NAME_3 || 'Mehmet',
            lastName: process.env.LAST_NAME_3 || 'Kaya',
            identityNumber: process.env.IDENTITY_NUMBER_3 || '45678901234',
            phone: process.env.PHONE_3 || '5554567890',
            email: process.env.EMAIL_3 || 'mehmet.kaya@example.com',
            priority: 3
        },
        {
            firstName: process.env.FIRST_NAME_4 || 'Fatma',
            lastName: process.env.LAST_NAME_4 || 'Şahin',
            identityNumber: process.env.IDENTITY_NUMBER_4 || '78901234567',
            phone: process.env.PHONE_4 || '5557890123',
            email: process.env.EMAIL_4 || 'fatma.sahin@example.com',
            priority: 4
        },
        {
            firstName: process.env.FIRST_NAME_5 || 'Ali',
            lastName: process.env.LAST_NAME_5 || 'Öztürk',
            identityNumber: process.env.IDENTITY_NUMBER_5 || '23456789012',
            phone: process.env.PHONE_5 || '5552345678',
            email: process.env.EMAIL_5 || 'ali.ozturk@example.com',
            priority: 5
        }
    ]
}; 