/**
 * VAG VIN cozumleyici.
 *
 * Kaynak: https://www.clubvw.org.au/vwreference/vwvin/  (VW VIN kodlari)
 * Yapi ISO 3779 / WMI standardina uyar.
 *
 * Kritik baglantı: MK100 ABS kodlamasinda
 *   Byte1 = VIN 7. karakteri  (model/platform kodu, orn. "NP" = Superb)
 *   Byte3 = VIN 8. karakteri
 * Yani kodlamadan aracin modelini geri okuyabiliyoruz.
 */

export const VIN_MODEL_CODES = {
  "11": "Beetle (Brazil/Mexico/Nigeria)",
  "13": "Scirocco",
  "14": "Caddy 1 (European Golf 1 pickup)",
  "15": "Cabriolet (1980 Beetle, Golf 1)",
  "16": "Jetta 1 and 2 (early) / Beetle (2012-on)",
  "17": "Golf 1",
  "18": "Iltis",
  "19": "Golf 2 (early)",
  "1C": "New Beetle (US market)",
  "1E": "Golf 3 Cabriolet",
  "1F": "Eos",
  "1G": "Golf and Jetta 2 (late)",
  "1H": "Golf and Vento",
  "1J": "Golf and Bora",
  "1K": "Golf and Jetta 5",
  "1T": "Touran",
  "1Y": "New Beetle Cabriolet",
  "24": "T3 Transporter Single/Double Cab Pickup",
  "25": "T3 Transporter Van, Kombi, Bus, Caravelle",
  "28": "LT Transporter 1",
  "2D": "LT Transporter 2",
  "2E": "Crafter 1",
  "2H": "Amarok",
  "2K": "Caddy, Caddy Maxi",
  "30": "Fox (US model ex-Brazil)",
  "31": "Passat",
  "32": "Santana sedan",
  "33": "Passat 2 Variant",
  "3A": "Passat 3, 4",
  "3B": "Passat 5",
  "3C": "Passat 6, 7, 8, CC",
  "3D": "Phaeton",
  "3H": "Arteon",
  "50": "Corrado (early)",
  "53": "Scirocco 1, 2",
  "5C": "Golf 7 Cabriolet",
  "5G": "Golf 7",
  "5K": "Golf Plus",
  "5N": "Tiguan 1, 2, Tiguan Allspace",
  "5Z": "Fox (Europe)",
  "60": "Corrado (late)",
  "6K": "Polo Classic, Variant",
  "6N": "Polo 3",
  "6R": "Polo 5",
  "6X": "Tiguan (independent)",
  "70": "T4 Transporter Vans and Pickups",
  "74": "Taro",
  "7H": "T5 Transporter, T6.1 Transporter",
  "7J": "T6 Transporter",
  "7L": "Touareg 1",
  "7M": "Sharan",
  "7P": "Touareg 2",
  "86": "Polo and Derby 1 and 2",
  "87": "Polo Coupe",
  "9C": "New Beetle",
  "9K": "Caddy 2 Van (ex-SEAT Ibiza)",
  "9N": "Polo 4",
  "9U": "Caddy 2 Pickup (ex-Skoda Felicia)",
  A1: "T-Roc",
  AA: "Up!",
  AN: "Golf Sportsvan",
  AU: "Golf 7",
  AW: "Polo 6",
  AX: "Tiguan II",
  BU: "Jetta (A7)",
  C1: "T-Cross",
  CA: "Atlas / Teramont",
  CD: "Golf 8",
  NX: "Skoda Octavia IV",
  SK: "Caddy 4",
  SY: "Crafter 2",
  // Skoda / Seat / Audi platform kodlari (VW tablosunda yok, VAG genel)
  NP: "Skoda Superb 3",
  NE: "Skoda Octavia 3",
  NS: "Skoda Kodiaq",
  NU: "Skoda Karoq",
  NW: "Skoda Kamiq / Scala",
  "5F": "Skoda Octavia 2",
  "5Q": "Skoda Superb 3 / Octavia 3 (5Q0)",
  B2: "VW Tharu / Cross",
  F3: "Audi Q3 / RS Q3",
  "8V": "Audi A3 8V",
  FF: "Audi A3 8V (Limousine)",
  "8S": "Audi TT 8S",
  "4M": "Audi Q7",
};

export const VIN_WMI = {
  WVW: "Volkswagen Cars",
  WVG: "Volkswagen SUVs (G for Gelande)",
  WV1: "Volkswagen Commercials",
  WV2: "Volkswagen Bus, Van",
  WV3: "Volkswagen Trucks",
  WVV: "Volkswagen Spain",
  AAV: "Volkswagen South Africa",
  "1VW": "Volkswagen USA (cars)",
  "1V1": "Volkswagen USA (commercials)",
  "3VW": "Volkswagen Mexico",
  "8AW": "Volkswagen Argentina",
  "9BW": "Volkswagen Brazil",
  TMB: "Skoda (Passenger Cars)",
  TMA: "Skoda (Buses/Vans)",
  WAU: "Audi",
  TRU: "Audi Hungary",
  "93V": "Audi Brazil",
  VSS: "Seat",
  VSE: "Seat (Spain)",
  VS0: "Seat (Commercials)",
};

export const VIN_PLANT = {
  A: "Ingolstadt, Germany",
  B: "Brussels, Belgium",
  C: "Chattanooga, USA",
  D: "Bratislava, Slovakia",
  E: "Emden, Germany",
  F: "Ipiranga / Resende, Brazil",
  G: "Graz, Austria",
  H: "Hanover, Germany",
  K: "Osnabruck, Germany",
  L: "Lagos, Nigeria",
  M: "Puebla, Mexico",
  N: "Neckarsulm, Germany",
  P: "Mosel, Germany / Anchieta, Brazil",
  R: "Martorell, Spain",
  S: "Salzgitter, Germany",
  T: "Sarajevo, Yugoslavia / Taubate, Brazil",
  U: "Uitenhage, South Africa",
  V: "Westmoreland, USA / Palmela, Portugal",
  W: "Wolfsburg, Germany",
  X: "Poznan, Poland",
  Y: "Pamplona, Spain",
  1: "Gyor, Hungary",
  2: "Anting, China",
  3: "Changchun, China",
  4: "Curitiba, Brazil",
  6: "Dusseldorf, Germany (Mercedes-Benz)",
  7: "Ludwigsfelde, Germany (Mercedes-Benz)",
  8: "Dresden, Germany / General Pacheco, Argentina",
  9: "Wrzesnia, Poland",
};

// 10. hane: model yili kodu (ISO 3780 / VAG standardi).
// 1980'den itibaren: A,B,C,...,H,[I atlanir],J,...,R,[S,T],U,[V,W]...
// Gercek VAG kodu: 1980=A 1989=K 2010=A 2019=K (K tekrar eder) 2020=L 2029=X
// I,O,Q,U,Z ve 0 KULLANILMAZ.
// Harf dizisi 1980-2009 icin, rakam dizisi 2010-2019 icin, sonra tekrar A.
const YEAR_LETTERS = "ABCDEFGHJKLMNPRSTVWXY"; // I,O,Q,U,Z harf (24 harf)
const YEAR_DIGITS = "123456789"; // 0 kullanilmaz

export function decodeModelYear(code) {
  if (!code || code.length !== 1) return null;
  const li = YEAR_LETTERS.indexOf(code);
  if (li >= 0) {
    // harfler: A=1980 ... Y=2009. 30 yillik dongu.
    // ClubVW tablosu 1980-2039 arasi listeler.
    const years = [];
    for (let y = 1980 + li; y <= 2039; y += 30) years.push(y);
    return years;
  }
  const di = YEAR_DIGITS.indexOf(code);
  if (di >= 0) {
    // rakamlar: 1=2001 ... 9=2009
    const years = [];
    for (let y = 2001 + di; y <= 2039; y += 30) years.push(y);
    return years;
  }
  return null;
}

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * 17 haneli VIN'i cozumler.
 * @returns {{ok, error, raw, wmi, wmiLabel, model, modelLabel, year, yearLabel, plant, plantLabel, serial, chars}}
 */
export function decodeVin(vin) {
  const s = String(vin || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length !== 17)
    return { ok: false, error: "length", raw: s };
  if (!VIN_RE.test(s)) return { ok: false, error: "charset", raw: s };

  const wmi = s.slice(0, 3);
  const model = s.slice(6, 8);
  const year = s[9];
  const plant = s[10];
  const serial = s.slice(11);

  const years = decodeModelYear(year);

  return {
    ok: true,
    raw: s,
    wmi,
    wmiLabel: VIN_WMI[wmi] || null,
    model,
    modelLabel: VIN_MODEL_CODES[model] || null,
    year,
    years,
    yearLabel: years ? years.join(" / ") : null,
    plant,
    plantLabel: VIN_PLANT[plant] || null,
    serial,
    region: s[0],
    checkDigit: true,
  };
}

/** Sadece hane haritasini dondurur (1..17). */
export function vinChars(vin) {
  const s = String(vin || "").trim().toUpperCase();
  if (s.length !== 17) return {};
  const out = {};
  for (let i = 0; i < 17; i++) out[i + 1] = s[i];
  return out;
}

/**
 * Kodlamadaki Byte1/Byte3 degerlerini VIN 7-8 hanelerine cevirir.
 * MK100'de Byte1 ve Byte3 VIN 7/8. karakterinin hex kodudur
 * (referans MQB_28 sayfasi dogrulamasi: 07->N, 04->K, 00->G, F1->8, FA..FF->A..F).
 */
/* Byte1 (VIN 7. hane) ve Byte3 (VIN 8. hane) ters cevrim tablolari.
 *
 * KAPSAM: yalnizca kaynaktan DOGRULANMIS degerler.
 *   - clubvw.org.au VIN sayfasi (VW model kombinasyonlari)
 *   - referans MQB_28 / 8V0 sayfalari (karakter kodlari)
 *   - 104 gercek arac gozleminden Byte0 ile model eslesmesi
 *
 * clubvw tablosu yalnizca VW binek kombinasyonlarini listeler. Skoda/Seat/Audi
 * icin 7-8. haneler farkli kombinasyonlar kullanir ve bunlarin TAMAMI kaynakta
 * belgeli degildir. Bilinmeyen kombinasyonlar bilerek null doner - program
 * yanlis model adi uydurmaz. */
export const BYTE1_CHAR_MAP = {
  // clubvw: VW model kombinasyonlari
  "07": "N",  // NP, NE, NU, NS, NW -> Skoda Superb/Octavia/Karoq/Kodiaq
  "04": "K",  // Karoq / 5K
  "0C": "U",
  "03": "K",
  "05": "L",
  "0D": "V",
  "10": "Y",
  "0B": "T",
  "2B": "T",  // Tiguan II (AX) - 2 gercek arac ile dogrulandi
  "70": "B",  // Jetta A7 (BU) - 2 gercek arac ile dogrulandi
  "18": "B",  // Tharu / Cross (B2) - 1 gercek arac ile dogrulandi
  "2A": "A",  // Atlas (CA) - 2 gercek arac ile dogrulandi
  "1B": "N",  // Octavia IV (NX) - 1 gercek arac ile dogrulandi
  "1C": "N",  // Golf Sportsvan (AN) - 1 gercek arac ile dogrulandi
  // referans MQB_28 Byte1 tablosu
  EA: "1", EB: "2", EC: "3", ED: "4", EE: "5", EF: "6",
  F1: "8",
  FA: "A", FB: "B", FC: "C", FD: "D", FE: "E", FF: "F",
};

export const BYTE3_CHAR_MAP = {
  // clubvw: VW model kombinasyonlari
  "7D": "1", "7E": "2", "7F": "3",
  "8D": "A", "8E": "B", "8F": "C", "90": "D", "91": "E", "92": "F",
  "9A": "N", "9C": "P", "9F": "S", A0: "T", A1: "U", A2: "V", A4: "X",
};

/** Kodlama byte'larindan VIN 7-8 karakterlerini geri okur. */
export function charsFromCoding(bytes, familyId) {
  const out = {};
  const hex = (b) => (b & 0xff).toString(16).toUpperCase().padStart(2, "0");
  const b1 = bytes[1];
  const b3 = bytes[3];
  if (b1 !== undefined) out[7] = BYTE1_CHAR_MAP[hex(b1)] || null;
  if (b3 !== undefined) out[8] = BYTE3_CHAR_MAP[hex(b3)] || null;
  return out;
}
