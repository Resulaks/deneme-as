"use strict";
/* Müşteriye gönderilecek mesajlar ve SMS / WhatsApp sağlayıcı bağlantıları.
   Saf fonksiyonlardır; fetch dışarıdan verilir, böylece test edilebilir. */

function tl(x) { return "₺" + Number(x || 0).toLocaleString("tr-TR"); }

/* Telefon: 905XXXXXXXXX biçimine çevirir, geçersizse "" döner */
function normPhone(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.indexOf("00") === 0) d = d.slice(2);
  if (d.length === 11 && d[0] === "0") d = "90" + d.slice(1);
  else if (d.length === 10 && d[0] === "5") d = "90" + d;
  return d.length === 12 && d.indexOf("905") === 0 ? d : "";
}

function firstName(o) { return String(o.name || "").trim().split(/\s+/)[0] || ""; }

/* Selamlama ve dükkan adı olmadan durum cümlesi (WhatsApp şablonunun 3. değişkeni) */
function core(o, st) {
  const no = o.no ? " (#" + o.no + ")" : "";
  switch (st) {
    case "Yeni": return "siparişiniz" + no + " alındı. Tutar: " + tl(o.total) + ". Dükkan onayladığında haber vereceğiz.";
    case "Hazırlanıyor": return "siparişiniz" + no + " onaylandı, hazırlanıyor.";
    case "Yolda": return "siparişiniz" + no + " yola çıktı. Kapıda ödeyeceğiniz tutar: " + tl(o.total) + ".";
    case "Teslim edildi": return "siparişiniz" + no + " teslim edildi. Afiyet olsun!";
    case "İptal": return "siparişiniz" + no + " iptal edilmiştir. Anlayışınız için teşekkür ederiz.";
    default: return "siparişinizin durumu: " + st + ".";
  }
}

/* SMS metni (sayfadaki statusMsg ile birebir aynı) */
function buildMessage(o, st, shop) {
  const n = firstName(o);
  return (n ? "Merhaba " + n + ", " : "Merhaba, ") + core(o, st) + " – " + shop;
}

async function readJson(r) { try { return await r.json(); } catch (e) { return {}; } }

/* ---- SMS: Netgsm REST v2 ---- */
async function sendNetgsm(c, phone12, text, fetchFn) {
  if (!c.user || !c.pass || !c.header) throw new Error("Netgsm ayarları eksik (NETGSM_USER / NETGSM_PASS / NETGSM_HEADER)");
  const r = await fetchFn("https://api.netgsm.com.tr/sms/rest/v2/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(c.user + ":" + c.pass).toString("base64"),
    },
    body: JSON.stringify({ msgheader: c.header, encoding: "TR", messages: [{ msg: text, no: phone12.slice(2) }] }),
  });
  const j = await readJson(r);
  if (!r.ok || String(j.code) !== "00") throw new Error("Netgsm " + (j.code || r.status) + (j.description ? ": " + j.description : ""));
  return { ch: "sms", id: j.jobid || "" };
}

/* ---- WhatsApp Business: Meta Cloud API (onaylı şablon, 3 değişken: ad, dükkan, durum cümlesi) ---- */
async function sendWhatsApp(c, phone12, o, st, shop, fetchFn) {
  if (!c.token || !c.phoneId) throw new Error("WhatsApp ayarları eksik (WA_TOKEN / WA_PHONE_ID)");
  const r = await fetchFn("https://graph.facebook.com/v21.0/" + c.phoneId + "/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + c.token },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone12,
      type: "template",
      template: {
        name: c.template || "siparis_durumu",
        language: { code: c.lang || "tr" },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: firstName(o) || "Müşterimiz" },
            { type: "text", text: shop },
            { type: "text", text: core(o, st) },
          ],
        }],
      },
    }),
  });
  const j = await readJson(r);
  if (!r.ok) throw new Error("WhatsApp " + ((j.error && j.error.code) || r.status) + (j.error && j.error.message ? ": " + j.error.message : ""));
  return { ch: "wa", id: (j.messages && j.messages[0] && j.messages[0].id) || "" };
}

/* Sipariş durumuna göre müşteriye mesaj gönderir. Sonuç siparişe "nt" olarak yazılır. */
async function sendNotification(cfg, order, st, shop, fetchFn) {
  const f = fetchFn || fetch;
  const base = { s: st };
  try {
    const phone = normPhone(order.phone);
    if (!phone) throw new Error("Geçersiz müşteri telefonu");
    if (cfg.provider === "netgsm") return Object.assign(base, { ok: true }, await sendNetgsm(cfg.netgsm || {}, phone, buildMessage(order, st, shop), f));
    if (cfg.provider === "whatsapp") return Object.assign(base, { ok: true }, await sendWhatsApp(cfg.wa || {}, phone, order, st, shop, f));
    throw new Error("NOTIFY_PROVIDER ayarlanmamış (netgsm veya whatsapp)");
  } catch (e) {
    return Object.assign(base, { ok: false, ch: cfg.provider === "whatsapp" ? "wa" : "sms", err: String((e && e.message) || e).slice(0, 200) });
  }
}

module.exports = { tl, normPhone, firstName, core, buildMessage, sendNetgsm, sendWhatsApp, sendNotification };
