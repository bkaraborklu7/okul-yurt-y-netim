"use strict";

const API_URL = "https://residential-aila-okul-yurt-backend-ebf598e1.koyeb.app";

// --- YARDIMCI FONKSİYONLAR ---

/**
 * Genel API istek fonksiyonu
 * @param {string} endpoint - API yolu
 * @param {object} options - Fetch seçenekleri
 */
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, options);
        if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Hatası (${endpoint}):`, error);
        return null;
    }
};
// 1. Yardımcı Fonksiyon: Tarih seçiciyi bugüne ayarlar
function tarihiBugunYap() {
    const picker = document.getElementById("etutTarihSecici");
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı
    picker.value = today;
    alert("Tarih bugüne ayarlandı.");
    loadEtutLog();
}
// Bugünün tarihini DD.MM.YYYY formatında döndürür
const getBugun = () => new Date().toLocaleDateString('tr-TR');

// --- ANA FONKSİYONLAR ---

/**
 * Admin Giriş İşlemi
 */
async function adminGirisYap() {
    const kullaniciAdi = document.getElementById('adminUser').value;
    const sifre = document.getElementById('adminPass').value;
    const errorEl = document.getElementById('loginHata');

    const data = await apiRequest('admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullaniciAdi, sifre })
    });

    if (data?.basarili) {
        document.getElementById('adminLoginScreen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('mainWrapper').style.display = 'block';
        sessionStorage.setItem('adminAuth', 'true');

        // Başlangıç verilerini yükle
        verileriYenile();
        belletmenleriGetir();
        kayitAlanlariniDuzenle();
    } else {
        errorEl.innerText = "Hatalı Giriş!";
    }
}

/**
 * Sekme Değiştirme ve Veri Yükleme
 */
function sekmeAc(id) {
    document.querySelectorAll('.view-section').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(id) || document.getElementById('adminAyarlarView');
    if (target) target.classList.add('active');

    const menu = document.getElementById('m-' + id);
    if (menu) menu.classList.add('active');

    // Sekmeye özel veri çekme işlemleri
    if (id === 'belletmen') belletmenleriGetir();
    if (id === 'kayit') kayitIzinleriniGetir();
    if (id === 'izinler') izinTalepleriniYukle();

    verileriYenile();
}

/**
 * Kayıt Formu Dinamik Alan Yönetimi
 */
function kayitAlanlariniDuzenle() {
    const tip = document.getElementById("yeniOgrenciTip").value;
    const fields = {
        sinif: document.getElementById("alan-sinif"),
        oda: document.getElementById("alan-oda")
    };

    fields.sinif.style.display = (tip === "YURTÇU" || tip === "EVCİ") ? "block" : "none";
    fields.oda.style.display = (tip === "YURTÇU") ? "block" : "none";
}

/**
 * Etüt Verilerini Sıfırla
 */
async function etutSifirla() {
    if (confirm("Tüm etüt yoklamasını sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
        const res = await apiRequest('etut-sifirla', { method: 'POST' });
        if (res) {
            alert("✅ Etüt listesi başarıyla sıfırlandı.");
            verileriYenile(); // Tabloyu güncelle
        } else {
            alert("❌ Sıfırlama işlemi başarısız oldu.");
        }
    }
}
/**
 * Nöbetçi Listesi Getirme ve Tabloyu İnşa Etme
 */
async function belletmenleriGetir() {
    let liste = await apiRequest('belletmenler');

    if (!liste || liste.length === 0) {
        const gunler = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
        liste = gunler.map(g => ({ gun: g, erkek: "", kiz: "" }));
    }

    const html = liste.map((b, i) => `
        <tr>
            <td><b>${b.gun}</b></td>
            <td><input type="text" id="erkek-${i}" value="${b.erkek || ''}" style="width:95%"></td>
            <td><input type="text" id="kiz-${i}" value="${b.kiz || ''}" style="width:95%"></td>
        </tr>
    `).join('');

    document.getElementById("belletmenBody").innerHTML = html;
}

/**
 * Tüm Verileri Yenileme (Dashboard, Öğrenci, Personel, Etüt, Hareketler, Yemekhane)
 */
async function verileriYenile() {
    const all = await apiRequest('ogrenciler');
    if (!all) return;

    let htmlOgr = "", htmlPers = "", htmlEtut = "";

    all.forEach(o => {
        const badgeClass = o.durum === 'YURTTA' ? 'yurtta' : (o.durum === 'IZINLI' ? 'izinli' : 'disarida');
        const badge = `<span class="badge ${badgeClass}">${o.durum}</span>`;

        if (o.tip === "ÖĞRETMEN" || o.tip === "PERSONEL") {
            htmlPers += `<tr><td><b>${o.ad}</b><br><small>ID: ${o.kartId}</small></td><td>${o.tip}</td><td>${badge}</td></tr>`;
        } else {
            htmlOgr += `<tr><td><b>${o.ad}</b><br><small>ID: ${o.kartId}</small></td><td>${o.sinif}/${o.oda}</td><td>${badge}</td></tr>`;
            if (o.tip === "YURTÇU") {
                htmlEtut += `<tr><td>${o.ogrenciNo}</td><td>${o.ad}</td><td>${o.sinif}</td><td>${o.etutDurumu === 'VAR' ? '✅' : '❌'}</td></tr>`;
            }
        }
    });

    document.getElementById("ogrenciTablosu").innerHTML = htmlOgr;
    document.getElementById("personelTablosu").innerHTML = htmlPers;
    document.getElementById("etutTablosu").innerHTML = htmlEtut;

    // Diğer listeleri yükle (Sessizce)
    loadActivityLog();
    loadCafeteriaLog();
    loadEtutLog();
}

/**
 * Ek Listeleri Yükleyen Fonksiyonlar
 */
async function loadGecmisHareketler() {
    const tarihKutusu = document.getElementById("hareketTarihSecici");
    const listeDiv = document.getElementById("gecmisHareketListesi");

    if (!tarihKutusu || !tarihKutusu.value) {
        return; // Sessizce çık, hata verme (alert istemiyorduk)
    }

    const logs = await apiRequest('hareketler');
    if (!logs) return;

    // Tarih formatla (2026-01-07 -> 07.01.2026)
    const [y, m, d] = tarihKutusu.value.split('-');
    const secilenTarih = `${d}.${m}.${y}`;

    // Seçilen tarihe göre filtrele
    const filtrelenmis = logs.filter(h => h.zaman && h.zaman.includes(secilenTarih));

    const html = filtrelenmis.reverse().map(h => `
        <div style="padding:10px; border-bottom:1px solid #eee;">
            🕒 ${h.zaman} - <b>${h.isim}</b>: ${h.mesaj}
        </div>
    `).join('') || `<div style="padding:10px; color:red;">🚫 ${secilenTarih} tarihinde kayıt bulunamadı.</div>`;

    listeDiv.innerHTML = html;
}
async function loadActivityLog() {
    const logs = await apiRequest('hareketler');
    if (!logs) return;

    // Bugünün tarihini al (Format: 07.01.2026)
    const today = new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Sadece BUGÜNÜN loglarını filtrele
    const bugunLoglari = logs.filter(h => h.zaman && h.zaman.includes(today));

    // En yeni 15 tanesini al ve ekrana bas (reverse ile en yeni en üstte)
    const html = bugunLoglari.slice(-15).reverse().map(h => `
        <div style="padding:10px; border-bottom:1px solid #eee;">
            🕒 ${h.zaman} - <b>${h.isim}</b>: ${h.mesaj}
        </div>
    `).join('') || `<div style="padding:10px; color:gray;">Bugün henüz bir hareket kaydedilmedi.</div>`;

    document.getElementById("hareketListesi").innerHTML = html;
}

async function loadCafeteriaLog() {
    const tarihKutusu = document.getElementById("yemekTarihSecici");
    const tabloGovdesi = document.getElementById("yemekhaneTabloGovdesi");

    if (!tarihKutusu?.value || !tabloGovdesi) return;

    const records = await apiRequest('yemekhane-listesi');
    if (!records) return;

    const [y, m, d] = tarihKutusu.value.split('-');
    const formatliTarih = `${d}.${m}.${y}`;

    const filtrelenmis = records.filter(e => e.tarih === formatliTarih);

    // Tabloyu temizle
    tabloGovdesi.innerHTML = "";

    if (filtrelenmis.length === 0) {
        tabloGovdesi.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Kayıt bulunamadı.</td></tr>`;
        return;
    }

    // Sadece veriyi işle
    filtrelenmis.forEach(e => {
        const row = tabloGovdesi.insertRow();
        row.insertCell(0).innerText = e.tarih;
        row.insertCell(1).innerText = e.isim || e.ad;
        row.insertCell(2).innerText = e.girisSaati || e.saat;
    });
}

async function izinTalepleriniYukle() {
    const talepler = await apiRequest('izin-talepleri');
    const tablo = document.getElementById("izinTalepleriTablosu");
    if (!talepler || !tablo) return;

    tablo.innerHTML = ""; // Önce temizle

    talepler.reverse().forEach(t => {
        const row = tablo.insertRow();

        // Badge rengini belirle
        const badgeClass = t.durum === 'BEKLIYOR' ? 'badge-İzinli' : (t.durum === 'ONAYLANDI' ? 'yurtta' : 'disarida');

        row.innerHTML = `
            <td>${t.isim}</td>
            <td>${t.tur}</td>
            <td>${t.tarih}</td>
            <td>${t.aciklama}</td>
            <td><span class="badge ${badgeClass}">${t.durum}</span></td>
            <td>
                ${t.durum === 'BEKLIYOR' ?
                `<button class="btn-s" onclick="izinIslem('${t.id}', 'ONAY')">✅</button>
                     <button class="btn-s" onclick="izinIslem('${t.id}', 'RED')">❌</button>`
                : 'Tamamlandı'}
            </td>
        `;
    });
}

function yemekTarihiBugunYap() {
    const today = new Date().toISOString().split('T')[0];
    const kutu = document.getElementById("yemekTarihSecici");
    if (kutu) {
        kutu.value = today;
        loadYemekLog();
    }
}
/**
 * Etüt Giriş Kayıtlarını (Loglarını) Getirir
 */
// Etüt kayıtlarını geçmişe dönük sorgulama fonksiyonu
async function loadEtutLog() {
    // 1. HTML elemanlarını kontrol et
    const tarihKutusu = document.getElementById("etutTarihSecici");
    const tabloGovdesi = document.getElementById("etutLogGövdesi");

    // Eğer bu elemanlar o an ekranda yoksa (başka sayfadaysan) fonksiyonu durdur
    if (!tarihKutusu || !tabloGovdesi) return;

    const secilenTarihRaw = tarihKutusu.value;

    if (!secilenTarihRaw) {
        return;
    }

    // Backend'den verileri çek
    const records = await apiRequest('etut-listesi');
    if (!records) return;

    // Tarih formatlama (2024-01-07 -> 07.01.2024)
    const [y, m, d] = secilenTarihRaw.split('-');
    const formatliTarih = `${d}.${m}.${y}`;

    // Filtreleme
    const filtrelenmis = records.filter(e => e.tarih === formatliTarih);

    // Tabloyu doldur
    if (filtrelenmis.length > 0) {
        tabloGovdesi.innerHTML = filtrelenmis.map(e => `
            <tr>
                <td>${e.tarih}</td>
                <td>${e.ad}</td>
                <td>${e.sinif}</td>
                <td>${e.saat}</td>
            </tr>
        `).join('');
    } else {
        tabloGovdesi.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">🚫 ${formatliTarih} tarihinde kayıt bulunamadı.</td></tr>`;
    }
}

function tarihiBugunYap() {
    const today = new Date().toISOString().split('T')[0]; // 2024-01-07 formatı
    const tarihKutusu = document.getElementById("etutTarihSecici");
    if (tarihKutusu) {
        tarihKutusu.value = today;
        loadEtutLog(); // Tarihi set edince otomatik sorgula
    }
}
/**
 * Kayıt ve Silme İşlemleri
 */
async function kayitIzinleriniGetir() {
    const nums = await apiRequest('izinli-numaralar');
    if (!nums) return;
    const html = nums.map(n => `
        <tr>
            <td>${n.numara}</td><td>${n.ad}</td><td>${n.kartId}</td><td>${n.tip}</td>
            <td><button class="btn btn-red" onclick="izinliNumaraSil('${n.id}')">Sil</button></td>
        </tr>
    `).join('');
    document.getElementById("izinliNumaralarTablosu").innerHTML = html;
}

async function izinliNumaraEkle() {
    const body = {
        numara: document.getElementById("yeniOgrenciNo").value,
        ad: document.getElementById("yeniOgrenciAd").value,
        kartId: document.getElementById("yeniKartId").value,
        tip: document.getElementById("yeniOgrenciTip").value,
        sinif: document.getElementById("yeniOgrenciSinif").value || "-",
        oda: document.getElementById("yeniOgrenciOda").value || "-"
    };

    await apiRequest('izinli-numara-ekle', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    kayitIzinleriniGetir();
    alert("✅ İşlem Başarılı!");
}

async function izinliNumaraSil(id) {
    if (confirm("Kaydı silmek istediğinize emin misiniz?")) {
        await apiRequest(`izinli-numara-sil/${id}`, { method: "DELETE" });
        kayitIzinleriniGetir();
    }
}

/**
 * Çıkış ve Yardımcı İşlemler
 */
function cikisYap() {
    sessionStorage.clear();
    location.reload();
}

// 5 Saniyede bir verileri tazele
setInterval(verileriYenile, 5000);

