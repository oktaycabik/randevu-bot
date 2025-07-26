const puppeteer = require('puppeteer');
const config = require('../config/default');
const logger = require('../utils/logger');
const NotificationService = require('../utils/notifier');

class AppointmentBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.retryCount = 0;
        this.lastFormStatus = false;
        this.currentUserIndex = 0;
    }

    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: ['--start-maximized']
            });

            this.page = await this.browser.newPage();
            await this.page.setUserAgent(config.browser.userAgent);
            
            // İlk sayfa yüklemesi
            await this.page.goto(config.appointment.url, {
                waitUntil: 'networkidle0',
                timeout: config.appointment.timeout
            });
            
            logger.info('Browser initialized successfully');
            console.log('\x1b[32m%s\x1b[0m', '🚀 Bot başlatıldı ve hazır!');
            console.log('\x1b[36m%s\x1b[0m', `📋 Toplam ${config.users.length} kullanıcı için randevu denenecek`);
        } catch (error) {
            logger.error('Failed to initialize browser', { error: error.message });
            throw error;
        }
    }

    async checkFormAvailability() {
        try {
            await this.page.reload({ waitUntil: 'networkidle0' });

            const isFormAvailable = await this.page.evaluate(() => {
                const form = document.querySelector('form');
                const formClosed = document.querySelector('.form-closed-message');
                const isVisible = form && window.getComputedStyle(form).display !== 'none';
                const isClosed = formClosed && window.getComputedStyle(formClosed).display !== 'none';
                return isVisible && !isClosed;
            });

            if (isFormAvailable !== this.lastFormStatus) {
                this.lastFormStatus = isFormAvailable;
                if (isFormAvailable) {
                    const currentUser = config.users[this.currentUserIndex];
                    await NotificationService.info(`Form açıldı! ${currentUser.firstName} ${currentUser.lastName} için doldurmaya başlıyorum...`);
                    console.log('\x1b[32m%s\x1b[0m', `✨ FORM AÇILDI! ${currentUser.firstName} ${currentUser.lastName} için doldurulmaya başlanıyor...`);
                } else {
                    console.log('\x1b[33m%s\x1b[0m', '⏳ Form şu anda kapalı, beklemeye devam ediyorum...');
                }
            }

            return isFormAvailable;
        } catch (error) {
            logger.error('Error checking form availability', { error: error.message });
            return false;
        }
    }

    async fillForm() {
        try {
            const currentUser = config.users[this.currentUserIndex];
            console.log('\x1b[36m%s\x1b[0m', `📝 Form ${currentUser.firstName} ${currentUser.lastName} için dolduruluyor...`);
            
            const selectors = config.form.selectors;

            // Her alan için görünürlük kontrolü ve doldurma
            for (const [field, selector] of Object.entries(selectors)) {
                if (field === 'submitButton') continue;
                
                console.log(`\x1b[36m%s\x1b[0m`, `📝 ${field} dolduruluyor...`);
                
                await this.page.waitForSelector(selector, { 
                    visible: true, 
                    timeout: 5000 
                });

                await this.page.evaluate((sel) => {
                    document.querySelector(sel).value = '';
                }, selector);

                await this.page.type(selector, currentUser[field], { delay: 50 });

                const fieldValue = await this.page.$eval(selector, el => el.value);
                if (fieldValue !== currentUser[field]) {
                    throw new Error(`${field} alanı doğru doldurulamadı`);
                }
            }

            console.log('\x1b[36m%s\x1b[0m', '🔄 Form gönderiliyor...');
            
            const submitButton = await this.page.waitForSelector('button[type="submit"]', { 
                visible: true, 
                timeout: 5000 
            });

            await submitButton.click();

            await this.page.waitForSelector('.loading-spinner', { 
                visible: true, 
                timeout: 5000 
            }).catch(() => {});

            await new Promise(resolve => setTimeout(resolve, 2000));

            const result = await this.page.evaluate(() => {
                const successElement = document.querySelector('.success-message');
                const errorElement = document.querySelector('.error-message');
                const loadingElement = document.querySelector('.loading-spinner');
                
                if (loadingElement && window.getComputedStyle(loadingElement).display !== 'none') {
                    return { success: false, message: 'Form işlemi devam ediyor...' };
                }
                
                if (successElement && window.getComputedStyle(successElement).display !== 'none') {
                    return { success: true, message: successElement.textContent.trim() };
                }
                
                if (errorElement && window.getComputedStyle(errorElement).display !== 'none') {
                    return { success: false, message: errorElement.textContent.trim() };
                }
                
                return { success: false, message: 'Form yanıtı alınamadı' };
            });

            if (result.success) {
                console.log('\x1b[32m%s\x1b[0m', `✅ BAŞARILI! ${currentUser.firstName} ${currentUser.lastName} için form başarıyla dolduruldu!`);
                logger.info('Form submitted successfully', { user: `${currentUser.firstName} ${currentUser.lastName}` });
                await NotificationService.success(`${currentUser.firstName} ${currentUser.lastName} için randevu alındı!`);
                
                await this.page.screenshot({
                    path: `success-${currentUser.firstName}-${currentUser.lastName}-${new Date().toISOString().replace(/:/g, '-')}.png`,
                    fullPage: true
                });

                // Sonraki kullanıcıya geç
                this.currentUserIndex++;
                this.retryCount = 0;

                // Tüm kullanıcılar tamamlandı mı kontrol et
                if (this.currentUserIndex >= config.users.length) {
                    console.log('\x1b[32m%s\x1b[0m', '🎉 TÜM KULLANICILAR İÇİN İŞLEM TAMAMLANDI!');
                    await NotificationService.success('Tüm kullanıcılar için randevu alma işlemi tamamlandı!');
                    return true;
                }

                return false;
            } else {
                throw new Error(result.message.replace(/\s+/g, ' '));
            }
        } catch (error) {
            const errorMessage = error.message.trim().replace(/\s+/g, ' ');
            const currentUser = config.users[this.currentUserIndex];
            console.log('\x1b[31m%s\x1b[0m', `❌ HATA: ${currentUser.firstName} ${currentUser.lastName} için ${errorMessage}`);
            logger.error('Error filling form', { error: errorMessage, user: `${currentUser.firstName} ${currentUser.lastName}` });
            await NotificationService.error(`${currentUser.firstName} ${currentUser.lastName} için hata: ${errorMessage}`);
            
            await this.page.screenshot({
                path: `error-${currentUser.firstName}-${currentUser.lastName}-${new Date().toISOString().replace(/:/g, '-')}.png`,
                fullPage: true
            }).catch(() => {});
            
            return false;
        }
    }

    async start() {
        try {
            await this.initialize();
            logger.info('Starting appointment monitoring');
            await NotificationService.info('Bot başlatıldı ve randevuları izliyor');
            console.log('\x1b[36m%s\x1b[0m', '🔍 Form kontrol ediliyor...');

            while (this.currentUserIndex < config.users.length) {
                const isAvailable = await this.checkFormAvailability();

                if (isAvailable) {
                    logger.info('Form is available, attempting to fill');
                    const success = await this.fillForm();

                    if (success) {
                        // Tüm kullanıcılar tamamlandıysa çık
                        if (this.currentUserIndex >= config.users.length) {
                            console.log('\x1b[32m%s\x1b[0m', '🎉 İŞLEM TAMAMLANDI! Bot kapatılıyor...');
                            await this.cleanup();
                            break;
                        }
                    } else {
                        this.retryCount++;
                        if (this.retryCount >= config.appointment.maxRetries) {
                            // Sonraki kullanıcıya geç
                            this.currentUserIndex++;
                            this.retryCount = 0;
                            if (this.currentUserIndex >= config.users.length) {
                                throw new Error('Tüm kullanıcılar için maksimum deneme sayısına ulaşıldı');
                            }
                            console.log('\x1b[33m%s\x1b[0m', `⚠️ Sonraki kullanıcıya geçiliyor: ${config.users[this.currentUserIndex].firstName} ${config.users[this.currentUserIndex].lastName}`);
                        }
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, config.appointment.checkInterval));
            }
        } catch (error) {
            logger.error('Bot error', { error: error.message });
            await NotificationService.error('Bot hatası: ' + error.message);
            await this.cleanup();
            throw error;
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            logger.info('Browser closed');
            console.log('\x1b[36m%s\x1b[0m', '👋 Browser kapatıldı');
        }
    }
}

module.exports = AppointmentBot; 