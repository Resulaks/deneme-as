# Ağa Döner – Online Sipariş

Tek sayfalık, tamamen istemci tarafında çalışan sipariş sitesi. Sunucu veya derleme adımı yoktur; Render üzerinde **Static Site** olarak yayınlanır.

## Yapı

```
.
├── public/
│   └── index.html     # Site (menü, sepet, WhatsApp siparişi, yönetim paneli)
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

## Önemli notlar

- Siparişler WhatsApp üzerinden işletmeye iletilir.
- Sepet, ürün düzenlemeleri ve sipariş geçmişi **tarayıcının localStorage** alanında tutulur (Yerel mod). Yani yönetim panelinde yapılan değişiklikler yalnızca o cihazda görünür ve diğer müşterilere yansımaz. Menüyü herkes için değiştirmek için `MENU` dizisini düzenleyip `git push` yapın.
- Canlı veritabanı modu (`window.claude`) yalnızca Claude ortamında çalışır; Render'da otomatik olarak yerel moda düşer.
