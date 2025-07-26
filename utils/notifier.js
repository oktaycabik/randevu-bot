const WindowsToaster = require('node-notifier').WindowsToaster;
const logger = require('./logger');

const notifier = new WindowsToaster({
    withFallback: false,
    customPath: undefined
});

class NotificationService {
    static async notify(title, message, type = 'info') {
        try {
            const options = {
                title,
                message,
                sound: true,
                type: type === 'error' ? 'error' : 'info'
            };

            notifier.notify(options);
            console.log(`\x1b[36m[${type.toUpperCase()}]\x1b[0m ${title}: ${message}`);
            logger.info('Notification sent', { title, message, type });
        } catch (error) {
            logger.error('Failed to send notification', { error: error.message });
            console.log(`\x1b[31m[ERROR]\x1b[0m Failed to send notification: ${message}`);
        }
    }

    static async success(message) {
        return this.notify('Success ✅', message, 'success');
    }

    static async error(message) {
        return this.notify('Error ❌', message, 'error');
    }

    static async info(message) {
        return this.notify('Info ℹ️', message, 'info');
    }
}

module.exports = NotificationService; 