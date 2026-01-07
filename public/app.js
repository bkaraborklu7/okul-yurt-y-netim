// const API_URL = "https://residential-aila-okul-yurt-backend-ebf598e1.koyeb.app";

// // GİRİŞ FONKSİYONU
// async function adminGirisYap() {
//     const kullaniciAdi = document.getElementById('adminUser').value;
//     const sifre = document.getElementById('adminPass').value;
//     try {
//         const res = await fetch(`${API_URL}/admin-login`, {
//             method: 'POST', headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ kullaniciAdi, sifre })
//         });
//         const data = await res.json();
//         if (data.basarili) {
//             document.getElementById('adminLoginScreen').style.display = 'none';
//             document.getElementById('sidebar').style.display = 'flex';
//             document.getElementById('mainWrapper').style.display = 'block';
//             sessionStorage.setItem('adminAuth', 'true');
//             verileriYenile();
//             belletmenleriGetir();
//             kayitAlanlariniDuzenle();
//         } else { document.getElementById('loginHata').innerText = "Hatalı Giriş!"; }
//     } catch (e) { document.getElementById('loginHata').innerText = "Sunucu Hatası!"; }
// }

// // SEKME YÖNETİMİ
// function sekmeAc(id) {
//     document.querySelectorAll('.view-section').forEach(d => d.classList.remove('active'));
//     document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
//     const targetSection = document.getElementById(id) || document.getElementById('adminAyarlarView');
//     if (targetSection) targetSection.classList.add('active');
//     document.getElementById('m-' + id).classList.add('active');

//     if (id === 'belletmen') belletmenleriGetir();
//     if (id === 'kayit') kayitIzinleriniGetir();
//     verileriYenile();
// }

// // KAYIT ALANLARINI DÜZENLE (DİNAMİK FORM)
// function kayitAlanlariniDuzenle() {
//     const tip = document.getElementById("yeniOgrenciTip").value;
//     const alanSinif = document.getElementById("alan-sinif");
//     const alanOda = document.getElementById("alan-oda");
//     const alanNo = document.getElementById("alan-no");

//     if (tip === "YURTÇU") {
//         alanSinif.style.display = "block";
//         alanOda.style.display = "block";
//     } else if (tip === "EVCİ") {
//         alanSinif.style.display = "block";
//         alanOda.style.display = "none";
//     } else { // Personel veya Öğretmen
//         alanNo.style.display = "none";
//         alanSinif.style.display = "none";
//         alanOda.style.display = "none";
//     }
// }

// // NÖBETÇİ LİSTESİ HÜCRELERİNİ AÇMA
// async function belletmenleriGetir() {
//     try {
//         const res = await fetch(`${API_URL}/belletmenler`);
//         let liste = await res.json();
//         if (!liste || liste.length === 0) {
//             liste = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"].map(g => ({ gun: g, erkek: "", kiz: "" }));
//         }
//         let html = "";
//         liste.forEach((b, i) => {
//             html += `<tr><td><b>${b.gun}</b></td>
//                         <td><input type="text" id="erkek-${i}" value="${b.erkek || ''}" style="width:95%"></td>
//                         <td><input type="text" id="kiz-${i}" value="${b.kiz || ''}" style="width:95%"></td></tr>`;
//         });
//         document.getElementById("belletmenBody").innerHTML = html;
//     } catch (e) { console.error(e); }
// }

// async function belletmenKaydet() {
//     const nl = [];
//     const gs = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
//     for (let i = 0; i < 7; i++) {
//         nl.push({
//             gun: gs[i],
//             erkek: document.getElementById(`erkek-${i}`).value,
//             kiz: document.getElementById(`kiz-${i}`).value
//         });
//     }
//     await fetch(`${API_URL}/belletmen-guncelle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nl) });
//     alert("✅ Nöbetçi listesi kaydedildi!");
// }

// async function verileriYenile() {
//     try {
//         const res = await fetch(`${API_URL}/ogrenciler`);
//         const all = await res.json();
//         let hOgr = "", hPers = "", hEtut = "";

//         all.forEach(o => {
//             const badge = `<span class="badge ${o.durum === 'YURTTA' ? 'yurtta' : (o.durum === 'IZINLI' ? 'izinli' : 'disarida')}">${o.durum}</span>`;
//             if (o.tip === "ÖĞRETMEN" || o.tip === "PERSONEL") {
//                 hPers += `<tr><td><b>${o.ad}</b><br><small>ID: ${o.kartId}</small></td><td>${o.tip}</td><td>${badge}</td></tr>`;
//             } else {
//                 hOgr += `<tr><td><b>${o.ad}</b><br><small>ID: ${o.kartId}</small></td><td>${o.sinif}/${o.oda}</td><td>${badge}</td></tr>`;
//                 if (o.tip === "YURTÇU") {
//                     hEtut += `<tr><td>${o.ogrenciNo}</td><td>${o.ad}</td><td>${o.sinif}</td><td>${o.etutDurumu === 'VAR' ? '✅' : '❌'}</td></tr>`;
//                 }
//             }
//         });
//         document.getElementById("ogrenciTablosu").innerHTML = hOgr;
//         document.getElementById("personelTablosu").innerHTML = hPers;
//         document.getElementById("etutTablosu").innerHTML = hEtut;

//         const resHar = await fetch(`${API_URL}/hareketler`);
//         const harks = await resHar.json();
//         let htmlHar = "";
//         harks.slice(0, 15).forEach(h => {
//             htmlHar += `<div style="padding:10px; border-bottom:1px solid #eee;">🕒 ${h.zaman} - <b>${h.isim}</b>: ${h.mesaj}</div>`;
//         });
//         document.getElementById("hareketListesi").innerHTML = htmlHar;

//         const resYem = await fetch(`${API_URL}/yemekhane-listesi`);
//         const yem = await resYem.json();
//         let htmlYem = "";
//         yem.forEach(y => {
//             htmlYem += `<tr><td>${y.tarih}</td><td>${y.isim}</td><td>${y.girisSaati}</td><td>${y.cikisSaati}</td></tr>`;
//         });
//         document.getElementById("yemekhaneTabloGövdesi").innerHTML = htmlYem;
//     } catch (e) { console.log(e); }
// }

// async function kayitIzinleriniGetir() {
//     const res = await fetch(`${API_URL}/izinli-numaralar`);
//     const nums = await res.json();
//     let h = "";
//     nums.forEach(n => {
//         h += `<tr><td>${n.numara}</td><td>${n.ad}</td><td>${n.kartId}</td><td>${n.tip}</td><td><button class="btn btn-red" onclick="izinliNumaraSil('${n.id}')">Sil</button></td></tr>`;
//     });
//     document.getElementById("izinliNumaralarTablosu").innerHTML = h;
// }

// async function izinliNumaraEkle() {
//     const body = {
//         numara: document.getElementById("yeniOgrenciNo").value,
//         ad: document.getElementById("yeniOgrenciAd").value,
//         kartId: document.getElementById("yeniKartId").value,
//         tip: document.getElementById("yeniOgrenciTip").value,
//         sinif: document.getElementById("yeniOgrenciSinif").value || "-",
//         oda: document.getElementById("yeniOgrenciOda").value || "-"
//     };
//     await fetch(`${API_URL}/izinli-numara-ekle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
//     kayitIzinleriniGetir();
//     alert("✅ Kayıt yetkisi verildi!");
// }

// async function adminBilgiGuncelle() {
//     const u = document.getElementById("yeniAdminUser").value;
//     const p = document.getElementById("yeniAdminPass").value;
//     if (!u || !p) return alert("Lütfen alanları doldurun!");
//     await fetch(`${API_URL}/admin-sifre-guncelle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ yeniKullaniciAdi: u, yeniSifre: p }) });
//     alert("✅ Admin bilgileri güncellendi! Lütfen yeniden giriş yapın.");
//     cikisYap();
// }

// async function sanalKartOkut() {
//     const kartId = document.getElementById("testKartId").value;
//     const kapiKodu = document.getElementById("testKapiKodu").value;
//     const endpoint = kapiKodu.includes("YEMEKHANE") ? "/yemekhane-kart" : "/yoklama-kart";
//     const res = await fetch(`${API_URL}${endpoint}`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ kartId, kapiKodu })
//     });
//     const data = await res.json();
//     document.getElementById("simulasyonSonuc").innerText = data.mesaj;
//     verileriYenile();
// }

// function cikisYap() { sessionStorage.clear(); location.reload(); }
// setInterval(verileriYenile, 5000);



/**
 * Yurt Yönetim Paneli - Optimize Edilmiş app.js
 */
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
    const html = records.map(y => `<tr><td>${y.tarih}</td><td>${y.isim}</td><td>${y.girisSaati}</td><td>${y.cikisSaati}</td></tr>`).join('');
    document.getElementById("yemekhaneTabloGövdesi").innerHTML = html;
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