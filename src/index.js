const { program } = require('commander');
const AppointmentBot = require('./AppointmentBot');
const logger = require('../utils/logger');
const express = require('express');
const path = require('path');

// CLI options
program
    .option('-d, --demo', 'Run in demo mode with local test server')
    .parse();

const options = program.opts();

// Start demo server if in demo mode
async function startDemoServer() {
    const app = express();
    const port = process.env.PORT || 3001; // Changed port to 3001

    app.use(express.static(path.join(__dirname, '../demo')));
    
    return new Promise((resolve, reject) => {
        const server = app.listen(port)
            .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    logger.error(`Port ${port} is in use, trying port ${port + 1}`);
                    server.listen(port + 1);
                } else {
                    reject(err);
                }
            })
            .on('listening', () => {
                const actualPort = server.address().port;
                logger.info(`Demo server running at http://localhost:${actualPort}`);
                // Update config with actual port
                process.env.APPOINTMENT_URL = `http://localhost:${actualPort}`;
                resolve(server);
            });
    });
}

// Main function
async function main() {
    let demoServer;
    
    try {
        if (options.demo) {
            demoServer = await startDemoServer();
        }

        const bot = new AppointmentBot();
        await bot.start();

    } catch (error) {
        logger.error('Application error', { error: error.message });
        process.exit(1);
    } finally {
        if (demoServer) {
            demoServer.close();
        }
    }
}

// Start the application
main(); 