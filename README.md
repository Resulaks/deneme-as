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

## Notlar

- Müşteri siparişi WhatsApp'a da gönderilir; Firebase bağlıysa ayrıca veritabanına kaydedilir.
- Firebase ayarlanmazsa site Yerel mod'da çalışır: veriler yalnızca o tarayıcıda saklanır.
- Menüyü herkes için değiştirmek: yönetici panelinden Ürünler sekmesi (Firebase bağlıysa) ya da koddaki `MENU` listesi.
