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
    }

    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Görünür mod
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
        } catch (error) {
            logger.error('Failed to initialize browser', { error: error.message });
            throw error;
        }
    }

    async checkFormAvailability() {
        try {
            // Sayfayı yenile
            await this.page.reload({ waitUntil: 'networkidle0' });

            const isFormAvailable = await this.page.evaluate(() => {
                const form = document.querySelector('form');
                const formClosed = document.querySelector('.form-closed-message');
                const isVisible = form && window.getComputedStyle(form).display !== 'none';
                const isClosed = formClosed && window.getComputedStyle(formClosed).display !== 'none';
                return isVisible && !isClosed;
            });

            // Form durumu değiştiğinde bildirim gönder
            if (isFormAvailable !== this.lastFormStatus) {
                this.lastFormStatus = isFormAvailable;
                if (isFormAvailable) {
                    await NotificationService.info('Form açıldı! Doldurmaya başlıyorum...');
                    console.log('\x1b[32m%s\x1b[0m', '✨ FORM AÇILDI! Doldurulmaya başlanıyor...');
                } else {
                    console.log('\x1b[33m%s\x1b[0m', '⏳ Form şu anda kapalı, beklemeye devam ediyorum...');
                }
            }

            return isFormAvailable;
        } catch (error) {
            logger.error('Error checking form availability', { error: error.message });
            // Hata durumunda sayfayı yeniden yüklemeyi dene
            try {
                await this.page.goto(config.appointment.url, {
                    waitUntil: 'networkidle0',
                    timeout: config.appointment.timeout
                });
            } catch (e) {
                logger.error('Failed to reload page', { error: e.message });
            }
            return false;
        }
    }

    async fillForm() {
        try {
            console.log('\x1b[36m%s\x1b[0m', '📝 Form dolduruluyor...');
            const selectors = config.form.selectors;
            const userData = config.userData;

            // Form görünürlüğünü kontrol et
            const formVisible = await this.page.evaluate(() => {
                const form = document.querySelector('form');
                return form && window.getComputedStyle(form).display !== 'none';
            });

            if (!formVisible) {
                throw new Error('Form artık görünür değil');
            }

            // Her alan için görünürlük kontrolü ve doldurma
            for (const [field, selector] of Object.entries(selectors)) {
                if (field === 'submitButton') continue;
                
                console.log(`\x1b[36m%s\x1b[0m`, `📝 ${field} dolduruluyor...`);
                
                // Alanın görünür olmasını bekle
                await this.page.waitForSelector(selector, { 
                    visible: true, 
                    timeout: 5000 
                });

                // Mevcut değeri temizle
                await this.page.evaluate((sel) => {
                    document.querySelector(sel).value = '';
                }, selector);

                // Yeni değeri yaz
                await this.page.type(selector, userData[field], { delay: 50 });

                // Değerin doğru yazıldığını kontrol et
                const fieldValue = await this.page.$eval(selector, el => el.value);
                if (fieldValue !== userData[field]) {
                    throw new Error(`${field} alanı doğru doldurulamadı`);
                }
            }

            console.log('\x1b[36m%s\x1b[0m', '🔄 Form gönderiliyor...');
            
            // Submit butonunun görünür olmasını bekle
            const submitButton = await this.page.waitForSelector('button[type="submit"]', { 
                visible: true, 
                timeout: 5000 
            });

            // Formu gönder
            await submitButton.click();

            // Loading spinner'ı bekle
            await this.page.waitForSelector('.loading-spinner', { 
                visible: true, 
                timeout: 5000 
            }).catch(() => {}); // spinner görünmezse devam et

            // Yanıt için bekle (en az 2 saniye)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Başarı veya hata mesajını kontrol et
            const result = await this.page.evaluate(() => {
                const successElement = document.querySelector('.success-message');
                const errorElement = document.querySelector('.error-message');
                const loadingElement = document.querySelector('.loading-spinner');
                
                // Hala yükleniyor mu kontrol et
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
                console.log('\x1b[32m%s\x1b[0m', '✅ BAŞARILI! Form başarıyla dolduruldu ve gönderildi!');
                logger.info('Form submitted successfully');
                await NotificationService.success('Form başarıyla dolduruldu ve randevu alındı!');
                
                // Ekran görüntüsü al
                await this.page.screenshot({
                    path: `success-${new Date().toISOString().replace(/:/g, '-')}.png`,
                    fullPage: true
                });
                
                return true;
            } else {
                throw new Error(result.message.replace(/\s+/g, ' '));
            }
        } catch (error) {
            const errorMessage = error.message.trim().replace(/\s+/g, ' ');
            console.log('\x1b[31m%s\x1b[0m', `❌ HATA: ${errorMessage}`);
            logger.error('Error filling form', { error: errorMessage });
            await NotificationService.error(`Form doldurulurken hata: ${errorMessage}`);
            
            // Hata durumunda ekran görüntüsü al
            await this.page.screenshot({
                path: `error-${new Date().toISOString().replace(/:/g, '-')}.png`,
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

            while (true) {
                const isAvailable = await this.checkFormAvailability();

                if (isAvailable) {
                    logger.info('Form is available, attempting to fill');
                    const success = await this.fillForm();

                    if (success) {
                        console.log('\x1b[32m%s\x1b[0m', '🎉 İŞLEM TAMAMLANDI! Bot kapatılıyor...');
                        await this.cleanup();
                        break;
                    } else {
                        this.retryCount++;
                        if (this.retryCount >= config.appointment.maxRetries) {
                            throw new Error('Maksimum deneme sayısına ulaşıldı');
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