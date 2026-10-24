# Ağa Döner – Online Sipariş

Tek sayfalık, tamamen istemci tarafında çalışan sipariş sitesi. Sunucu veya derleme adımı yoktur; Render üzerinde **Static Site** olarak yayınlanır.

## Yapı

```
.
├── public/
│   └── index.html     # Site (menü, sepet, WhatsApp siparişi, yönetim paneli)
├── public/firebase-config.js  # Firebase ve Google Haritalar anahtarları
├── firestore.rules    # Firestore güvenlik kuralları
├── firebase.json / .firebaserc  # Firebase CLI ayarları (functions + kurallar)
├── functions/         # Müşteriye otomatik SMS / WhatsApp (isteğe bağlı, aşağıya bakın)
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
- **Haritadan konum seç:** OpenStreetMap haritasında işaretçi sürüklenir ya da haritaya dokunulur. İlçe, mahalle ve sokak alanları işaretlenen konumdan otomatik dolar. Google Haritalar bağlantısı ya da koordinat (ör. `40.91, 38.70`) yapıştırılabilir. `GMAPS_KEY` tanımlıysa harita ve adres arama Google Haritalar ile çalışır, tanımlı değilse ücretsiz OpenStreetMap'e düşer.
- Sepet iki adımlıdır: 1) ürünleri düzenle (adet, seçenek, not), 2) teslimat ve ödeme.

> Bu özellikler için `firestore.rules` içeriğinin güncel halini Firebase'e yayınlamanız gerekir (`settings` koleksiyonu eklendi).

## Notlar

- **Firebase bağlıyken** sipariş doğrudan dükkana (yönetici paneline) düşer; müşteri WhatsApp açmaz, siparişini sitede canlı takip eder. Kayıt başarısız olursa müşteriye "WhatsApp ile gönder" seçeneği sunulur.
- **Firebase yokken (yerel mod)** sipariş yalnızca müşterinin gönderdiği WhatsApp mesajıyla dükkana ulaşır.
- Firebase ayarlanmazsa site Yerel mod'da çalışır: veriler yalnızca o tarayıcıda saklanır.
- Menüyü herkes için değiştirmek: yönetici panelinden Ürünler sekmesi (Firebase bağlıysa) ya da koddaki `MENU` listesi.

## Mesafeye göre minimum sepet tutarı

Yönetici paneli → **Dükkan** → **Mesafeye göre minimum sepet**: kademeler eklenir, örn. `10 km’ye kadar ₺250`, `20 km’ye kadar ₺500`.

- Müşterinin adresi dükkana ne kadar uzaksa o kademenin tutarı geçerli olur. Son kademeden uzak adreslerde son kademenin tutarı uygulanır.
- Sitedeki "Min." etiketi, sepet uyarıları ve adres kartları müşterinin seçtiği adrese göre değişir. Adres henüz yoksa aralık ("₺250–₺500, adresinize göre") gösterilir.
- Mesafe belli değilken sepet en düşük kademenin altındaysa ilerlenemez; kesin tutar adres doğrulanınca kontrol edilir.
- Kademe yoksa **Teslimat ve ödeme** bölümündeki genel minimum sepet tutarı kullanılır. Kademeler için dükkan konumu girilmiş olmalıdır; mesafe kuş uçuşu hesaplanır. Teslimat yarıçapı (km) ayrı bir sınırdır ve aynı şekilde çalışmaya devam eder.

## Sipariş takibi ve müşteri bildirimleri

1. Müşteri **Siparişi Gönder**'e basınca sipariş sistemde kaydolur ve doğrudan dükkan paneline düşer. Müşteri WhatsApp açmaz.
2. Müşteri ekranda sipariş numarasını ve canlı durumu görür (Alındı → Hazırlanıyor → Yolda → Teslim edildi). Sayfada "📦 Siparişim" düğmesi kalır; sayfa yenilense bile 24 saat içindeki siparişler takip edilir.
3. Dükkan durumu değiştirince müşteriye sayfada bildirim çıkar (ses, titreşim ve izin verdiyse tarayıcı bildirimi). Bu sadece sayfa açıkken/arka plandayken çalışır; sayfa kapalıyken haber vermek için aşağıdaki otomatik SMS/WhatsApp servisi gerekir.
4. Panelde her siparişte **📲 Müşteriye yaz** düğmesi vardır: müşteriye güncel durum mesajı hazır olarak WhatsApp'ta açılır (dükkanın kendi telefonundan, tek dokunuşla).

> Sipariş kimliği tahmin edilemeyen rastgele bir koddur. Kurallar, kimliği bilen müşterinin yalnızca kendi siparişini okumasına izin verir; sipariş listesi, güncelleme ve silme yalnızca yöneticidedir. Bunun çalışması için `firestore.rules` dosyasını yeniden **Publish** etmeniz gerekir.

## Müşteriye otomatik SMS / WhatsApp (isteğe bağlı)

Sipariş oluşunca ve durumu değişince dükkan adına müşteriye otomatik mesaj gider (Yeni: "alındı", Hazırlanıyor, Yolda, Teslim edildi, İptal). Statik bir site mesaj gönderemediği için küçük bir sunucu tarafı servisi (Firebase Cloud Functions, `functions/` klasörü) kullanılır.

**Gerekenler**
- Firebase **Blaze** (kullandıkça öde) planı. Kredi kartı ister; küçük hacimde ücretsiz kotalar içinde kalır.
- Bilgisayarda Node.js 20 veya üstü.
- Bir mesaj kanalı hesabı (ücretlidir, kullanım başına faturalanır):
  - **SMS:** Netgsm hesabı, API kullanıcısı ve onaylı mesaj başlığı.
  - **WhatsApp:** Meta Business hesabı + WhatsApp Business Cloud API numarası + onaylı şablon. Şablon adı `siparis_durumu`, dili Türkçe, kategorisi *Utility*, gövdesi:
    `Merhaba {{1}}, {{2}} bilgilendirmesi: {{3}} Teşekkür ederiz.`

**Kurulum**
1. `npm install -g firebase-tools` ardından `firebase login`.
2. Repo klasöründe: `cd functions && npm install && cd ..`
3. `functions/.env.example` dosyasını `functions/.env` olarak kopyalayın ve doldurun (kanal, anahtarlar, bölge). Bu dosya GitHub'a gönderilmez.
4. `firebase deploy --only functions,firestore:rules`
5. Yönetici paneli → **Dükkan** → **Müşteri bildirimleri** kutusunu işaretleyip kaydedin. (Kutu kapalıyken hiçbir mesaj gönderilmez; kredi bittiğinde buradan durdurabilirsiniz.)
6. Test siparişi verin. Panelde siparişin altında "Müşteriye SMS gönderildi" ya da hata sebebi görünür. Ayrıntılı kayıtlar için `firebase functions:log`.

**Not:** `FUNCTION_REGION`, Firestore konumunuzla uyumlu olmalıdır (`eur3` → `europe-west1`, `nam5` → `us-central1`, tek bölge ise aynısı).

## Google Haritalar anahtarı

`public/firebase-config.js` içindeki `GMAPS_KEY` alanına [Google Cloud](https://console.cloud.google.com) üzerinden alınan anahtar yazılır. **Maps JavaScript API** ve **Geocoding API** etkin olmalıdır. Anahtar tarayıcıda görünür; kötüye kullanılmaması için anahtar ayarlarında *Web sitesi (HTTP referrer)* kısıtlamasına sitenizin adresini ekleyin ve *API kısıtlaması*nı yalnızca bu iki API'ye bırakın. Anahtar boşsa harita OpenStreetMap'e düşer.
