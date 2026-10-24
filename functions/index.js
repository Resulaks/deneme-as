"use strict";
/* Sipariş oluşunca ve durumu değişince müşteriye otomatik SMS / WhatsApp gönderir.
   Panelde "Müşteri bildirimleri" kutusu işaretli değilse hiçbir şey göndermez. */
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const notify = require("./notify");

admin.initializeApp();
setGlobalOptions({ region: process.env.FUNCTION_REGION || "europe-west1", maxInstances: 5 });

function config() {
  return {
    provider: String(process.env.NOTIFY_PROVIDER || "").toLowerCase(),
    netgsm: { user: process.env.NETGSM_USER, pass: process.env.NETGSM_PASS, header: process.env.NETGSM_HEADER },
    wa: { token: process.env.WA_TOKEN, phoneId: process.env.WA_PHONE_ID, template: process.env.WA_TEMPLATE, lang: process.env.WA_LANG },
  };
}

async function handle(ref, order, status) {
  const shopSnap = await admin.firestore().doc("settings/shop").get();
  const shop = shopSnap.exists ? shopSnap.data() : {};
  if (shop.autoMsg !== true) return;                                    // panelde kapalı
  if (order.nt && order.nt.ok && order.nt.s === status) return;         // aynı durum için tekrar gönderme
  const res = await notify.sendNotification(config(), order, status, shop.shop || process.env.SHOP_NAME || "Dükkan");
  await ref.update({ nt: Object.assign({ at: Date.now() }, res) });
}

exports.orderCreated = onDocumentCreated("orders/{id}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const o = snap.data();
  await handle(snap.ref, o, o.status || "Yeni");
});

exports.orderStatusChanged = onDocumentUpdated("orders/{id}", async (event) => {
  const b = event.data.before.data();
  const a = event.data.after.data();
  if (!a || !b || b.status === a.status) return;                        // nt yazımı gibi diğer güncellemeleri yok say
  await handle(event.data.after.ref, a, a.status);
});

exports._handle = handle; // testler için
