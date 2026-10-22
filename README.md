# Ağa Döner – Online Sipariş

Tek sayfalık, tamamen istemci tarafında çalışan sipariş sitesi. Sunucu veya derleme adımı yoktur; Render üzerinde **Static Site** olarak yayınlanır.

## Yapı

```
.
├── public/
│   └── index.html     # Site (menü, sepet, WhatsApp siparişi, yönetim paneli)
├── public/firebase-config.js  # Firebase bağlantı bilgileri
├── firestore.rules    # Firestore güvenlik kuralları
├── render.yaml        # Render Blueprint (otomatik kurulum)
├── .gitignore
└── README.md
```

## Render'a yayınlama

### Yöntem 1 – Blueprint (önerilen)
1. Bu repoyu GitHub'a gönderin.
2. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**.
3. Repoyu seçin; `render.yaml` otomatik okunur → **Apply**.

### Yöntem 2 – Elle
1. **New +** → **Static Site** → repoyu seçin.
2. Build Command: `echo ok` (veya boş)
3. Publish Directory: `public`
4. **Create Static Site**

Her `git push` sonrası site otomatik yeniden yayınlanır.

## Ayarlar

`public/index.html` içindeki `AYARLAR` bölümünü düzenleyin:

- `PHONE` – WhatsApp numarası (örn. `905321234567`, başında `+` ve `0` olmadan)
- `SHOP`, `FEE`, `MINORDER`
- `INFO` – adres, telefon, çalışma saatleri
- `MENU` – ürünler ve fiyatlar

## Siparişlerin tüm yöneticilerde görünmesi (Firebase)

Siparişler Firebase Firestore'da saklanır; yönetici paneline giren herkes aynı siparişleri canlı görür, yeni sipariş gelince bip sesi çalar.

1. [console.firebase.google.com](https://console.firebase.google.com) → **Proje ekle**.
2. **Build → Firestore Database → Create database** (production mode, konum: `eur3` veya `europe-west`).
3. **Build → Authentication → Get started → Email/Password** yöntemini etkinleştirin.
4. **Authentication → Users → Add user** ile yönetici hesaplarını oluşturun (e-posta + şifre).
5. **Authentication → Settings → Authorized domains** → Render adresinizi ekleyin (`siteniz.onrender.com`).
6. **Firestore → Rules** sekmesine `firestore.rules` içeriğini yapıştırın, `YONETICI@ORNEK.COM` yerine yönetici e-postalarını yazın, **Publish**.
7. **Proje ayarları → Genel → Web uygulaması ekle (`</>`)** → çıkan `firebaseConfig` değerlerini `public/firebase-config.js` içine yazın.
8. `git add . && git commit -m "Firebase" && git push`

Yönetici girişi artık Firebase e-posta/şifresiyle yapılır; koddaki `admin / admin123` yalnızca Firebase kurulmamışsa (Yerel mod) geçerlidir.

## Yönetici paneli özellikleri

- **Sesli alarm:** Durumu "Yeni" olan sipariş varken panel açık olduğu sürece her 6 saniyede bir çift bip çalar. Sipariş "Hazırlanıyor" yapılınca durur. Sekme başlığında da yeni sipariş sayısı görünür. Tarayıcı sesi için sayfaya bir kez dokunmak gerekir.
- **Siparişleri kapat/aç:** Panelin üstündeki düğme anında müşterilere yansır. Kapalıyken müşteriler sepeti açıp sipariş veremez, sayfada uyarı görürler. Kural dosyası da kapalıyken yeni sipariş yazılmasını engeller.
- **Dükkan sekmesi:** Dükkan adı, WhatsApp numarası, telefon, adres, hakkında, teslimat bölgesi, ödeme yöntemleri, teslimat ücreti, minimum sepet, çalışma saatleri ve kapalıyken gösterilecek mesaj buradan düzenlenir.
- **Ürünler sekmesi:** Kategori adı, sıra ve silme; ürün adı, fiyat, sıra; ekstralar ve çıkarılabilir malzemeler tek tek eklenir.

- **Teslimat alanı:** Dükkan sekmesinde dükkan konumu (adresten bul / şu anki konum) ve en fazla teslimat mesafesi (km) girilir. Müşteri adresi mesafeyi aşarsa "kapsama alanı dışında" uyarısı görür ve sipariş veremez. Mesafe kuş uçuşu hesaplanır; adres konuma OpenStreetMap Nominatim ile çevrilir. Sipariş kartında ve WhatsApp mesajında mesafe ile harita bağlantısı yer alır.

## Müşteri tarafı

- Sağ üstteki **📍 Adres** düğmesinden **birden fazla adres** (Ev, İş…) eklenir, seçilir, düzenlenir ve silinir. Adresler yalnızca müşterinin cihazında (tarayıcı yerel depolaması) tutulur, sunucuya gönderilmez.
- **Haritadan konum seç:** OpenStreetMap haritasında işaretçi sürüklenir ya da haritaya dokunulur. İlçe, mahalle ve sokak alanları işaretlenen konumdan otomatik dolar. Google Haritalar bağlantısı ya da koordinat (ör. `40.91, 38.70`) yapıştırılabilir. Google'ın harita bileşeni API anahtarı ve faturalandırma gerektirdiği için ücretsiz OpenStreetMap kullanılır.
- Sepet iki adımlıdır: 1) ürünleri düzenle (adet, seçenek, not), 2) teslimat ve ödeme.

> Bu özellikler için `firestore.rules` içeriğinin güncel halini Firebase'e yayınlamanız gerekir (`settings` koleksiyonu eklendi).

## Notlar

- Müşteri siparişi WhatsApp'a da gönderilir; Firebase bağlıysa ayrıca veritabanına kaydedilir.
- Firebase ayarlanmazsa site Yerel mod'da çalışır: veriler yalnızca o tarayıcıda saklanır.
- Menüyü herkes için değiştirmek: yönetici panelinden Ürünler sekmesi (Firebase bağlıysa) ya da koddaki `MENU` listesi.
