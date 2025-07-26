require('dotenv').config();
const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

// Konfigürasyon değişkenleri
const config = {
    url: process.env.RANDEVU_URL,
    kisiselBilgiler: {
        ad: process.env.AD,
        soyad: process.env.SOYAD,
        tc: process.env.TC,
        telefon: process.env.TELEFON,
        email: process.env.EMAIL
    },
    kontrolSuresi: parseInt(process.env.KONTROL_SURESI) || 5000,
    browserVisible: process.env.BROWSER_VISIBLE === 'true'
};

// Bildirim gönderme fonksiyonu
function bildirimGonder(baslik, mesaj) {
    notifier.notify({
        title: baslik,
        message: mesaj,
        sound: true,
        wait: true
    });
}

// Form doldurma fonksiyonu
async function formuDoldur(page) {
    try {
        // Form elemanlarını doldur
        await page.type('#ad', config.kisiselBilgiler.ad);
        await page.type('#soyad', config.kisiselBilgiler.soyad);
        await page.type('#tc', config.kisiselBilgiler.tc);
        await page.type('#telefon', config.kisiselBilgiler.telefon);
        await page.type('#email', config.kisiselBilgiler.email);

        // Formu gönder
        await page.click('#gonderButton');
        
        bildirimGonder('Başarılı!', 'Randevu başarıyla alındı!');
        return true;
    } catch (error) {
        console.error('Form doldurulurken hata:', error);
        bildirimGonder('Hata!', 'Form doldurulurken bir hata oluştu!');
        return false;
    }
}

// Ana kontrol fonksiyonu
async function sayfayiKontrolEt() {
    const browser = await puppeteer.launch({
        headless: !config.browserVisible,
        defaultViewport: null
    });

    try {
        const page = await browser.newPage();
        console.log('Randevu sayfası kontrol ediliyor...');

        while (true) {
            await page.goto(config.url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Form sayfasının açık olup olmadığını kontrol et
            const formAcikMi = await page.evaluate(() => {
                // Bu kısmı sayfanın yapısına göre özelleştirin
                const form = document.querySelector('form');
                const formKapali = document.querySelector('.form-kapali-mesaji');
                return form && !formKapali;
            });

            if (formAcikMi) {
                console.log('Form sayfası açıldı! Form dolduruluyor...');
                const basarili = await formuDoldur(page);
                if (basarili) {
                    // Başarılı olduktan sonra programı sonlandır
                    await browser.close();
                    process.exit(0);
                }
            } else {
                console.log('Form henüz açık değil. Tekrar deneniyor...');
                // Belirtilen süre kadar bekle
                await new Promise(resolve => setTimeout(resolve, config.kontrolSuresi));
            }
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        bildirimGonder('Hata!', 'Bot çalışırken bir hata oluştu!');
        await browser.close();
        // Hata durumunda programı yeniden başlat
        sayfayiKontrolEt();
    }
}

// Programı başlat
console.log('Randevu botu başlatılıyor...');
sayfayiKontrolEt(); 