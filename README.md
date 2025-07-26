# Otomatik Randevu Takip Botu 🤖

Bu bot, randevu sistemlerini otomatik olarak takip eder ve form açıldığında hızlıca doldurur. Özellikle rastgele açılan ve hızla doldurulan randevu sistemleri için idealdir.

## 🚀 Özellikler

- **Sürekli İzleme**: Otomatik form kontrolü
- **Otomatik Doldurma**: Form açıldığında hızlı doldurma
- **Akıllı Tekrar**: Başarısız durumda otomatik tekrar deneme
- **Görsel Geri Bildirim**: Terminal'de renkli durum gösterimi
- **Masaüstü Bildirimleri**: Önemli olaylar için bildirim
- **Ekran Görüntüsü**: Başarılı/başarısız durumların kaydı
- **Hata Yönetimi**: Güçlü hata yakalama ve loglama
- **Demo Modu**: Test için örnek websitesi

## 🛠️ Kullanılan Teknolojiler

- **Node.js**: Çalışma ortamı
- **Puppeteer**: Tarayıcı otomasyonu
- **Express**: Demo sunucusu
- **Winston**: Loglama sistemi
- **node-notifier**: Masaüstü bildirimleri
- **Bootstrap**: Demo sayfa tasarımı

## 📋 Gereksinimler

- Node.js (v14 veya üstü)
- npm (Node Paket Yöneticisi)
- Windows, macOS veya Linux işletim sistemi

## 🔧 Kurulum

1. **Projeyi indirin**
   ```bash
   git clone [repository-url]
   cd randevu-bot
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Çevre değişkenlerini ayarlayın**
   - `.env.example` dosyasını `.env` olarak kopyalayın
   - Bilgilerinizi güncelleyin:
   ```env
   APPOINTMENT_URL=https://randevu-sitesi.com
   FIRST_NAME=Adınız
   LAST_NAME=Soyadınız
   IDENTITY_NUMBER=TC Kimlik No
   PHONE=Telefon No
   EMAIL=Email Adresiniz
   CHECK_INTERVAL=5000
   BROWSER_VISIBLE=true
   ```

## 🎮 Kullanım

1. **Demo Modunda Çalıştırma**
   ```bash
   npm run demo
   ```

2. **Gerçek Siteyle Çalıştırma**
   ```bash
   npm start
   ```

## 🔍 Nasıl Çalışır?

1. **Başlangıç**
   - Tarayıcıyı başlatır (görünür veya görünmez)
   - Loglama ve bildirimleri ayarlar
   - Konfigürasyonu yükler

2. **İzleme Süreci**
   - Sürekli form kontrolü yapar
   - Formun açılmasını bekler
   - Form varlığını doğrular

3. **Form Doldurma**
   - Tüm gerekli alanları otomatik doldurur
   - Girilen verileri doğrular
   - Form gönderimini yapar

4. **Sonuç İşleme**
   - Başarı/başarısızlık durumunu yakalar
   - Ekran görüntüsü alır
   - Bildirim gönderir
   - Sonuçları loglar

## 📁 Proje Yapısı

```
randevu-bot/
├── src/
│   ├── index.js           # Giriş noktası
│   └── AppointmentBot.js  # Ana bot sınıfı
├── config/
│   └── default.js         # Konfigürasyon
├── utils/
│   ├── logger.js          # Loglama yardımcısı
│   └── notifier.js        # Bildirim yardımcısı
├── demo/
│   └── index.html         # Demo randevu sayfası
└── logs/                  # Log dosyaları
```

## ⚙️ Konfigürasyon

### Form Seçicileri
`config/default.js` dosyasını sitenize göre güncelleyin:
```javascript
form: {
    selectors: {
        firstName: 'input#firstName',
        lastName: 'input#lastName',
        identityNumber: 'input#identityNumber',
        phone: 'input#phone',
        email: 'input#email',
        submitButton: 'button[type="submit"]'
    }
}
```

### Zamanlama Ayarları
```javascript
appointment: {
    checkInterval: 5000,    // 5 saniyede bir kontrol
    maxRetries: 3,          // Maksimum deneme sayısı
    timeout: 30000          // Sayfa yükleme zaman aşımı
}
```

## 📝 Loglama

- **Başarı Logları**: `logs/combined.log`
- **Hata Logları**: `logs/error.log`
- **Ekran Görüntüleri**: Ana dizinde kaydedilir
  - Başarılı: `success-[tarih].png`
  - Hata: `error-[tarih].png`

## 🔔 Bildirimler

Bot şu durumlar için bildirim gönderir:
- Bot başlatıldığında
- Form açıldığında
- Başarılı gönderimde
- Hata durumlarında

## 🛡️ Hata Yönetimi

- **Ağ Sorunları**: Otomatik tekrar dener
- **Form Doğrulama**: Girdi doğruluğunu kontrol eder
- **Gönderim Hataları**: Akıllı tekrar deneme sistemi
- **Sayfa Yükleme**: Zaman aşımı yönetimi

## 🌟 En İyi Uygulamalar

1. **Test**
   - Her zaman önce demo modunda test edin
   - Seçicileri çalıştırmadan önce doğrulayın
   - Logları kontrol edin

2. **Konfigürasyon**
   - `.env` dosyasını güvende tutun
   - Seçicileri dikkatli güncelleyin
   - Zamanlamaları ihtiyaca göre ayarlayın

3. **İzleme**
   - Ekran görüntülerini kontrol edin
   - Log dosyalarını takip edin
   - Bildirimleri izleyin

## ⚠️ Önemli Notlar

1. **Yasal Konular**
   - Sitenin kullanım şartlarını kontrol edin
   - İstek sınırlamalarına uyun
   - Sorumlu kullanın

2. **Güvenlik**
   - `.env` dosyasını asla paylaşmayın
   - Hassas bilgileri koruyun
   - Güvenli bağlantı kullanın

3. **Performans**
   - Kontrol aralıklarını uygun ayarlayın
   - Sistem kaynaklarını izleyin
   - Eski ekran görüntülerini/logları temizleyin

## 🤝 Katkıda Bulunma

Şunları yapabilirsiniz:
- Hata bildirin
- Özellik önerin
- Pull request gönderin

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır.

## 🙋‍♂️ Destek

Sorun ve sorularınız için:
- Repository'de issue oluşturun
- Mevcut dokümantasyonu kontrol edin
- Hata loglarını inceleyin

## 🔄 Güncellemeler

Repository'i düzenli kontrol edin:
- Hata düzeltmeleri
- Yeni özellikler
- Güvenlik güncellemeleri
- Performans iyileştirmeleri 