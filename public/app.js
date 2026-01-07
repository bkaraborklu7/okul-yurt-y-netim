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
 * Yemekhane Takip Listesini Sıfırla
 */
async function yemekhaneSifirla() {
    if (confirm("Yemekhane giriş listesini temizlemek üzeresiniz. Onaylıyor musunuz?")) {
        const res = await apiRequest('yemekhane-sifirla', { method: 'POST' });
        if (res) {
            alert("✅ Yemekhane listesi temizlendi.");
            loadCafeteriaLog(); // Tabloyu güncelle
        } else {
            alert("❌ İşlem sırasında bir hata oluştu.");
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
async function loadActivityLog() {
    const logs = await apiRequest('hareketler');
    if (!logs) return;
    const html = logs.slice(0, 15).map(h => `<div style="padding:10px; border-bottom:1px solid #eee;">🕒 ${h.zaman} - <b>${h.isim}</b>: ${h.mesaj}</div>`).join('');
    document.getElementById("hareketListesi").innerHTML = html;
}

async function loadCafeteriaLog() {
    const records = await apiRequest('yemekhane-listesi');
    if (!records) return;

    const bugun = getBugun();
    // Veritabanındaki tarihler ile bugünü kıyasla
    const bugunkuKayitlar = records.filter(y => y.tarih === bugun);

    const html = bugunkuKayitlar.map(y => `
        <tr>
            <td>${y.tarih}</td>
            <td>${y.isim}</td>
            <td>${y.girisSaati}</td>
            <td>${y.cikisSaati || '-'}</td>
        </tr>
    `).join('');

    document.getElementById("yemekhaneTabloGövdesi").innerHTML =
        html || '<tr><td colspan="4" style="text-align:center;">Bugün henüz yemekhane girişi yok.</td></tr>';
}
/**
 * Etüt Giriş Kayıtlarını (Loglarını) Getirir
 */
async function loadEtutLog() {
    const records = await apiRequest('etut-listesi');
    if (!records) return;

    const secilenTarihRaw = document.getElementById("etutTarihSecici").value;
    if (!secilenTarihRaw) return;

    // 1. Format Dönüştürme (Çok Kritik!)
    // Seçici: 2024-01-07 -> Backend: 07.01.2024
    const [y, m, d] = secilenTarihRaw.split('-');
    const formatliTarih = `${d}.${m}.${y}`;

    console.log("Seçilen (Formatlı):", formatliTarih);
    console.log("Backend'den Gelen İlk Kayıt Tarihi:", records[0]?.tarih);

    // 2. Filtreleme
    const filtrelenmisKayitlar = records.filter(e => {
        // Hem boşlukları temizleyelim hem de tam eşleşme arayalım
        return e.tarih && e.tarih.trim() === formatliTarih;
    });

    // 3. Ekrana Basma
    const html = filtrelenmisKayitlar.map(e => `
        <tr>
            <td>${e.tarih}</td>
            <td>${e.ad}</td>
            <td>${e.sinif}</td>
            <td>${e.saat}</td>
        </tr>
    `).join('');

    document.getElementById("etutLogGövdesi").innerHTML =
        html || `<tr><td colspan="4" style="text-align:center; color:red;">🚫 ${formatliTarih} tarihinde kayıt bulunamadı.</td></tr>`;
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
    document.getElementById("izinliNumaralarTablosu").innerHTML = h;
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