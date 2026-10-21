// Firebase Console → Proje ayarları → Genel → "Web uygulaması" bölümündeki
// yapılandırmayı buraya yapıştırın. Bu değerler gizli değildir, herkese açık olabilir;
// güvenliği firestore.rules dosyası sağlar.
// apiKey boş bırakılırsa site "Yerel mod"da çalışır (siparişler paylaşılmaz).
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
