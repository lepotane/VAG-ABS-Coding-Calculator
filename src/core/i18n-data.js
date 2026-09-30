/**
 * Veri kaynakli metin cevirisi.
 *
 * referans ve kaynak projelerden gelen anlamlar orijinal dilindedir
 * (ingilizce / almanca). Program tamamen Turkce ya da tamamen Ingilizce
 * gostermek icin burada bir TERIM SOZLUGU uygulanir.
 *
 * Kapsam bilincli: yalnizca yaygin, tekrarlanan terimler cevrilir.
 * Cevrilmeyen metin kaynak diliyle (Kaynak metin rozetiyle) gosterilir.
 */

const TR = {
  // yon
  "LHD": "Sol Direksiyon",
  "RHD": "Sağ Direksiyon",
  "Left Hand Drive": "Sol Direksiyon",
  "Right Hand Drive": "Sağ Direksiyon",
  "steering side": "direksiyon tarafı",
  "w/": "/",
  "w/o": "hariç",
  "w": "",
  "with": "ile",
  "without": "hariç",
  "or": "veya",
  "and": "ve",
  "narrow": "dar",
  "front": "ön",
  "rear": "arka",
  "brake": "fren",
  "brakes": "frenler",
  "disc": "disk",
  "rotor": "disk",
  "mm": "mm",

  // cekis / sanziman
  "FWD": "Önden Çekiş",
  "AWD": "Dört Çeker",
  "AWD ": "Dört Çeker ",
  "4Motion": "4Motion",
  "Diff-Lock": "Diferansiyel Kilidi",
  "DSG": "DSG (Çift Kavramalı)",
  "6MT": "6 İleri Manuel",
  "Manual": "Manuel",
  "Automatic": "Otomatik",
  "Sanziman": "Şanzıman",
  "Transmission": "Şanzıman",
  "Drivetrain": "Çekiş",
  "FWD + ": "Önden Çekiş + ",
  "AWD + ": "Dört Çeker + ",

  // motor / emisyon
  "Gasoline": "Benzin",
  "Diesel": "Dizel",
  "TDI": "TDI (Dizel)",
  "TSI": "TSI (Benzin)",
  "VR6": "VR6",
  "Hybrid": "Hibrit",
  "Tiguan": "Tiguan",
  "m": "motor",
  "T6": "T6",
  "Caddy": "Caddy",
  "Transporter": "Transporter",
  "Multivan": "Multivan",
  "California": "California",
  "Campervan": "Campervan",
  "Kombi": "Kombi",
  "transporter": "Transporter",
  "camper": "Camper",
  "kombi": "Kombi",
  "LHD EU5 ohne Start/Stop": "Sol Direksiyon EU5 Start/Stop'suz",
  "RHD EU5 ohne Start/Stop": "Sağ Direksiyon EU5 Start/Stop'suz",
  "LHD EU5 mit Start/Stop": "Sol Direksiyon EU5 Start/Stop'lu",
  "RHD EU5 mit Start/Stop": "Sağ Direksiyon EU5 Start/Stop'lu",
  "LHD EU6 mit Start/Stop": "Sol Direksiyon EU6 Start/Stop'lu",
  "RHD EU6 mit Start/Stop": "Sağ Direksiyon EU6 Start/Stop'lu",

  // ekipman
  "Start/Stop": "Start/Stop",
  "Start-Stop": "Start-Stop",
  "Autohold": "Otomatik Tutma",
  "Auto Hold": "Otomatik Tutma",
  "Auto-hold": "Otomatik Tutma",
  "Hill Hold Control": "Eğim Tutma",
  "Hill start": "Eğim Kalkış",
  "hill start": "Eğim Kalkış",
  "Hill start assist": "Eğim Kalkış Desteği",
  "hill descent": "Eğim İniş",
  "Hill Descent Control": "Eğim İniş Kontrolü",
  "Front Assist": "Ön Bölge Asistanı",
  "Front assist": "Ön Bölge Asistanı",
  "ACC": "ACC (Uyarlanabilir Hız Sabitleme)",
  "PLA": "Park Asistanı",
  "Park Assist": "Park Asistanı",
  "TPMS": "TPMS (Lastik Basınç)",
  "TPM": "TPMS (Lastik Basınç)",
  "TPMS mit Sensor in Reifen": "Lastik içi sensörlü TPMS",
  "TPMS ohne Sensor in Reifen": "Lastik içi sensörsüz TPMS",
  "TPM mit Sensor in Reifen": "Lastik içi sensörlü TPMS",
  "TPM ohne Sensor in Reifen": "Lastik içi sensörsüz TPMS",
  "SET-Taste für TPM": "TPMS SET Tuşu",
  "ESP-Off-Taste": "ESP Kapalı Tuşu",
  "XDS": "XDS (Extended Differential)",
  "EDL": "EDL (Elektronik Diferansiyal Kilidi)",
  "EDS": "EDS (Elektronik Diferansiyal Kilidi)",
  "ABS": "ABS",
  "ESP": "ESP",
  "ESC": "ESC",
  "Multi Collision Braking": "Çoklu Çarpma Frenleme",
  "Multikollisionsbremsung": "Çoklu Çarpma Frenleme",
  "Multi-Collision Braking": "Çoklu Çarpma Frenleme",
  "HDC": "HDC (Yokuş İniş Kontrolü)",
  "Offroad": "Arazi",
  "Off-road": "Arazi",
  "Traction Control": "Çekiş Kontrolü",
  "ASR": "ASR (Kayma Kontrolü)",
  "Emergency Braking": "Acil Frenleme",
  "Active Info Display": "Aktif Bilgi Ekranı",
  "Virtual Cockpit": "Sanal Kokpit",
  "Tire Pressure Monitoring System": "Lastik Basınç İzleme Sistemi",
  "Rear Brake": "Arka Fren",
  "Rear Suspension": "Arka Süspansiyon",
  "Front Brake": "Ön Fren",
  "Suspension Variant": "Süspansiyon Varyantı",
  "Suspension": "Süspansiyon",
  "Torsion Bar": "Burulma Çubuğu",
  "Torsion bar": "Burulma Çubuğu",
  "Multi-Link": "Çoklu Bağlantılı",
  "Multi Link": "Çoklu Bağlantılı",
  "Multilink": "Çoklu Bağlantılı",
  "Differing Tire Diameter": "Farklı Lastik Çapı",
  "Tyre": "Lastik",
  "Tire": "Lastik",
  "Brake Booster": "Fren Servosu",
  "Brake Booster Type": "Fren Servosu Tipi",
  "Steering Ratio": "Direksiyon Katsayısı",
  "Steering Wheel": "Direksiyon Simidi",
  "Vacuum Sensor": "Vakum Sensörü",
  "Rollover Prevention": "Devrilme Önleme",
  "Rollover Prevention (ROP)": "Devrilme Önleme (ROP)",
  "Side Assist": "Yan Asistan",
  "Side assist": "Yan Asistan",
  "Rear Brake Pads": "Arka Fren Balataları",
  "Front Brake Pads": "Ön Fren Balataları",
  "Brake Pads": "Fren Balataları",
  "Basic Settings": "Temel Ayarlar",
  "Basic Settings Missing": "Temel Ayarlar Eksik",
  "steering angle sensor": "direksiyon açı sensörü",
  "Steering Angle Sensor": "Direksiyon Açı Sensörü",
  "roller": "tekerlek",
  "Dynamic Start Assist": "Dinamik Kalkış Desteği",
  "VAQ": "VAQ (Hava Kalite Sensörü)",
  "Roller": "Tekerlek",
  "Pressure Sensor": "Basınç Sensörü",
  "brake pressure sensor": "fren basınç sensörü",
  "Autohold turn on message": "Otomatik Tutma açılış mesajı",
  "EPC": "EPC (Elektronik Gaz Pedalı)",
  "Pedal": "Pedal",
  "Disc": "Disk",
  "Bitte auswählen": "Seçiniz",
};

const EN = {
  "LHD": "Left-hand drive",
  "RHD": "Right-hand drive",
  "Left Hand Drive": "Left-hand drive",
  "Right Hand Drive": "Right-hand drive",
  "steering side": "steering side",
  "w/": "/",
  "w/o": "without",
  "w": "",
  "Front": "Front",
  "Rear": "Rear",
  "FWD": "Front-wheel drive",
  "AWD": "All-wheel drive",
  "Diff-Lock": "Differential lock",
  "Manual": "Manual",
  "Automatic": "Automatic",
  "Autohold": "Auto Hold",
  "Hill Hold Control": "Hill Hold Control",
  "Hill start": "Hill start",
  "hill descent": "Hill descent",
  "Front Assist": "Front Assist",
  "PLA": "Park Assist",
  "Park Assist": "Park Assist",
  "TPMS": "Tyre pressure monitoring",
  "TPM": "Tyre pressure monitoring",
  "SET-Taste für TPM": "TPMS SET button",
  "ESP-Off-Taste": "ESP off button",
  "XDS": "XDS",
  "EDL": "EDL",
  "EDS": "EDS",
  "HDC": "HDC",
  "Offroad": "Off-road",
  "Off-road": "Off-road",
  "Traction Control": "Traction control",
  "ASR": "ASR",
  "Active Info Display": "Active Info Display",
  "Virtual Cockpit": "Virtual Cockpit",
  "Multi Collision Braking": "Multi-collision braking",
  "Multikollisionsbremsung": "Multi-collision braking",
  "Multi-Collision Braking": "Multi-collision braking",
  "Rear Brake": "Rear brake",
  "Rear Suspension": "Rear suspension",
  "Front Brake": "Front brake",
  "Suspension": "Suspension",
  "Torsion Bar": "Torsion bar",
  "Torsion bar": "torsion bar",
  "Multi-Link": "Multi-link",
  "Multi Link": "Multi-link",
  "Multilink": "Multi-link",
  "Tyre": "Tyre",
  "Tire": "Tyre",
  "Brake Booster": "Brake booster",
  "Steering Ratio": "Steering ratio",
  "Steering Wheel": "Steering wheel",
  "Vacuum Sensor": "Vacuum sensor",
  "Rollover Prevention": "Rollover prevention",
  "Side Assist": "Side assist",
  "Rear Brake Pads": "Rear brake pads",
  "Front Brake Pads": "Front brake pads",
  "Basic Settings": "Basic settings",
  "Dynamic Start Assist": "Dynamic start assist",
  "Pressure Sensor": "Pressure sensor",
  "Autohold turn on message": "Auto-hold turn-on message",
  "Kombi": "Panel van",
  "transporter": "Transporter",
  "camper": "Camper",
  "kombi": "Panel van",
  "LHD EU5 ohne Start/Stop": "LHD EU5 without Start/Stop",
  "RHD EU5 ohne Start/Stop": "RHD EU5 without Start/Stop",
  "LHD EU5 mit Start/Stop": "LHD EU5 with Start/Stop",
  "RHD EU5 mit Start/Stop": "RHD EU5 with Start/Stop",
  "LHD EU6 mit Start/Stop": "LHD EU6 with Start/Stop",
  "RHD EU6 mit Start/Stop": "RHD EU6 with Start/Stop",
  "Bitte auswählen": "Please select",
  "Tiguan": "Tiguan",
};

const DICTS = { tr: TR, en: EN };

// Uzun ifadeler once, kisa sonra (yapisal birebir eslesme icin)
const KEYS = {
  tr: Object.keys(TR).sort((a, b) => b.length - a.length),
  en: Object.keys(EN).sort((a, b) => b.length - a.length),
};

/** Tam ifade eslesmesi: metin sozlukte varsa cevirir. */
export function translateTerm(text, lang) {
  if (!text) return text;
  const d = DICTS[lang];
  if (!d) return text;
  if (Object.prototype.hasOwnProperty.call(d, text)) return d[text];
  return text;
}

/**
 * Metni cevirir. Tam ifade bulunamazsa parca parca dener.
 * @returns {{text, translated:boolean, changed:boolean}}
 */
export function translateMeaning(text, lang) {
  if (!text) return { text, translated: true, changed: false };
  const s = String(text);
  const exact = translateTerm(s, lang);
  if (exact !== s) return { text: exact, translated: true, changed: true };

  const keys = KEYS[lang] || [];
  let out = s;
  let changed = false;
  for (const k of keys) {
    if (!k || k.length < 2) continue;
    if (out.includes(k)) {
      const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      if (re.test(out)) {
        out = out.replace(re, DICTS[lang][k]);
        changed = true;
      }
    }
  }
  return { text: out, translated: changed, changed };
}

/** Aile etiketlerini cevirir (veri setinde Turkce yazili olanlar icin). */
export function translateFamilyLabel(label, lang) {
  if (lang !== "tr") return label;
  return label
    .replace(/Continental /g, "Continental ")
    .replace(/ - /g, " - ");
}
