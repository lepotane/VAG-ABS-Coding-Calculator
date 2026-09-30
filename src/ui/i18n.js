/**
 * Cok dilli sozluK.
 * Kural: arayuz metinleri (etiket, dugme, ipucu) TAMAMEN dile gore degisir.
 * Veri kaynakli anlamlar (referans/vagcode metinleri) orijinal dilinde kalir;
 * bunlar icin "source" rozeti gosterilir.
 */

export const STR = {
  tr: {
    appTitle: "VAG ABS Kodlama Hesaplayıcı",
    tagline: "VAG ABS / ESP uzun kodlama çözümleyici ve kod üretici",

    tabDecode: "Çözümle",
    tabEncode: "Üret",
    tabVin: "VIN",
    tabLearn: "Veri Seti",

    family: "Aile / Platform",
    familyHint: "Hangi ABS ünitesi? Parça numaran (5Q0 614 517 gibi) buradan seçilir.",
    length: "Bayt sayısı",
    code: "Uzun kodlama",
    codePlaceholder: "Örn. 1E 07 6A 9C 34 23 23 74 …",
    decode: "Çözümle",
    clear: "Temizle",
    copy: "Kopyala",
    copied: "Kopyalandı",
    source: "Kaynak metin",
    sourceNote: "Bu anlam kaynaktan (referans / forum) birebir gelir; çeviri yoktur.",

    byte: "Bayt",
    hex: "Hex",
    binary: "İkili",
    meaning: "Anlam",
    status: "Kanıt",
    role: "Görev",
    observedIn: "Gerçek araçlarda",
    mirrorOf: "Ayna kaynağı",
    mirrorOk: "Ayna doğru",
    mirrorBad: "Ayna bozuk",
    mirrorExpected: "Olmalıydı",
    noData: "Kayıt bulunamadı",
    tableEmpty: "(boş)",

    warnings: "Uyarılar",
    mirrorSummary: "Ayna kontrolü",
    mirrorPassed: "baytın aynası doğru",
    error: "Hata",
    wipedTitle: "Kod silinmiş görünüyor",
    wipedBody:
      "Tüm baytlar sıfır. Bu modül fabrika sıfırlaması sonrası kodlamayı kaybetti anlamına gelir. " +
      "Aynı donanımdan bir donor kodu alıp kendi VIN'ine göre yeniden üretmelisin.",

    encVehicle: "Araç / donanım",
    encVinCard: "VIN ve temel kod",
    encVin: "VIN",
    encVinHint: "7, 8 ve 13-17. karakterler doğrudan koda yazılır.",
    encDonor: "Donor kod",
    encDonorHint: "Bilmediğin baytlar bu koddan doldurulur. Aynı modül donanımı olmalı.",
    encTail: "Kuyruk bloğu",
    encTailHint: "Byte 30+ pazar bölgesine göre değişir. Otomatik = en yaygın.",
    encGenerate: "Kod üret",
    encResult: "Üretilen kod",
    encApplied: "Uygulanan baytlar",
    encGaps: "Belirlenemeyen bayt",
    encFromDonor: "Donor koddan alındı",
    encMirrorAuto: "Aynalar otomatik hesaplandı",
    encLength: "Kod uzunluğu",
    encSelVehicle: "Araç varyantı",
    encSelBrake: "Fren + direksiyon",
    encSelFront: "Ön fren",
    encSelSteer: "Direksiyon / ROP",
    encSelEpb: "EPB / çalıştırma",
    encSelDrive: "Çekiş",
    encSelEds: "EDS / lastik",
    encSelRear: "Arka fren",

    learnTitle: "Veri seti ve kanıt seviyeleri",
    learnSchema: "Şema sürümü",
    learnVersion: "Veri sürümü",
    learnFamilies: "Aile",
    learnObs: "Gerçek araç kaydı",
    learnAdditions: "referans dışında eklenen",
    learnAccuracy: "Ortalama isabet",
    learnMirrorRule: "Ayna kuralı doğrulaması",
    learnTable: "Bayt doğrulama tablosu",
    learnNote:
      "Bir değerin 'test edilmiş' olması VCDS'de çalıştığı anlamına gelmez. " +
      "Program yalnızca kaynakta bulunan bilgiyi gösterir.",

    evTested: "Test edilmiş",
    evObserved: "Gerçek araçtan",
    evUnconfirmed: "%100 teyit değil",
    evUntested: "Test edilmemiş",
    evUnknown: "Bilinmiyor",
    evUnclassified: "Sınıflanmamış",
    evNoDesc: "Açıklama yok",
    evDerived: "Hesaplandı",

    disclaimer:
      "Canlı araca yazmadan önce orijinal kodlamayı yedekleyin. " +
      "Kabul edilen kod bile arıza kaydı bırakabilir.",
    footerWarn:
      "Canlı araca yazmadan önce orijinal kodlamayı yedekleyin. Kabul edilen kod bile arıza kaydı bırakabilir.",
    author: "Yapımcı: Samet Muriç",
    auto: "Otomatik",
    wordRecord: "kayıt",
    famUnsupported: "üretim kapalı",

    /* --- En sık / otomatik doldurma --- */
    enSik: "En sık",
    enSikOf: "En sık (%{n} araçta görüldü)",
    autoFillHeader: "Otomatik doldurulan baytlar",
    autoFillNote:
      "Bazı baytlar tüm araçlarda aynıdır; girilmeden otomatik yazıldı. " +
      "Geri kalanlar için en sık değer kullanıldı — canlıya yazmadan önce kontrol edin.",
    autoFillMirror: "ayna (hesaplandı)",
    autoFillConstant: "sabit (tüm araçlarda aynı)",
    autoFillMostCommon: "en sık değer",
    autoFillDonor: "donör koddan",
    autoFillSelection: "seçiminiz",
    autoFillVin: "VIN",
    gapWarning:
      "%{n} bayt tahmin edildi (en sık değer). Bunları kontrol edin veya " +
      "benzer bir araç kodu seçin.",
    donorOptional: "isteğe bağlı",
    donorHintNone:
      "Boş bırakırsanız bilinmeyen baytlar için en sık değerler kullanılır.",
    donorPick: "Benzer araç seç",
    donorPickNone: "— kendi kodum —",
    donorHint:
      "Aynı aileden gerçek bir araç kodunu temel alın. Bilinmeyen baytlar " +
      "bu koddan doldurulur.",
    vinRequired: "VIN zorunlu",
    vinRequiredHint:
      "Bu ailede VIN baytları araçtan araç değişir. Kod üretmek için " +
      "17 haneli VIN gerekir.",
    vinOptional: "VIN gerekmiyor",
    vinOptionalHint:
      "Bu ailede VIN baytları tüm araçlarda aynıdır; VIN girmeden de " +
      "kod üretilebilir.",
    byteHeader: "Bayt",
    platformCodes: "Platform kodları",
    /* Secim listesi istatistigi */
    optMostCommon: "en sık %{n}/%{m} araçta",
    optAlso: "ayrıca",
    /* Veri seti sekmesi */
    learnUniqueCodes: "benzersiz kod",
    learnPartial: "yarım kodlama",
    learnMirrorRate: "ayna doğrulama",
    learnMirrorHint:
      "Her aile kendi ayna kuralını gerçek araç kodlarıyla sınanır. " +
      "Ayna kuralı: hedef bayt, kaynak baytın bitrev'idir.",
    learnFamily: "Aile",
    learnNoMirror: "ayna yok",
    learnExceptions: "Bilinen istisnalar",
    learnExceptionsHint:
      "Kaynak verideki tek sapmalar. Kural değiştirilmedi, kayıt not olarak tutuldu.",
    learnVehicle: "Araç",
    learnPart: "Parça numarası",
    learnSources: "Kaynaklar",
    grpMk100: "MK100 / MQB — 29-48 bayt (156 araç)",
    grpCompact: "MK60EC1 / kompakt — 18-20 bayt (107 araç)",
    grpEsp9: "Bosch ESP9 — 31 bayt (10 araç)",
    grpPq46: "PQ46 / 2Q0 — 53-59 bayt (9 araç)",
    grpOther: "Diğer ABS modülleri (yalnızca çözümleme)",
    role_vehicle_variant: "Araç",
    role_front_brake: "Ön fren",
    role_brake_side: "Fren tarafı",
    role_steering: "Direksiyon",
    role_drivetrain: "Çekiş / şanzıman",
    role_tpms: "TPMS / lastik",
    role_eds_tire: "EDS / lastik",
    role_epb_startup: "EPB / çalıştırma",
    role_wheel_sensor: "Tekerlek sensörü",
    role_hill_hold_engine: "Yokuş kalkış / motor",
    role_acc_front_assist: "ACC / ön yardım",
    wordRecommended: "tavsiye",
    wordBytes: "bayt",
    wordErrors: "hata",
    mirrorRuleUndefined: "Ayna kuralı tanımsız",
    codingModelCode: "Kodlama model kodu",
    vinModelUnknown: "VIN model kodu bilinmiyor",
    incomplete: "Eksikler",

    // VIN
    vinTitle: "VIN çözümleme",
    vinDecode: "VIN çöz",
    vinPlaceholder: "TMBXXXXXXX389X89 (17 hane)",
    vinInvalid: "VIN 17 karakter olmalı ve I/O/Q kullanılmaz.",
    vinWmi: "Üretici (1-3)",
    vinModel: "Model (7-8)",
    vinYear: "Model yılı (10)",
    vinPlant: "Fabrika (11)",
    vinSerial: "Seri (12-17)",
    vinUnknownChar: "bilinmiyor",
    vinWmiVW: "Volkswagen Binek",
    vinPlantUnknown: "fabrika kodu çözümlenemedi",
    vinCheckDigit:
      "Avrupa / VW: 9. hane kontrol hanesi değildir, dolgu 'Z' kullanılır. " +
      "Kaynak: clubvw.org.au/vwreference/vwvin/",
  },

  en: {
    appTitle: "VAG ABS Coding Calculator",
    tagline: "VAG ABS / ESP long coding decoder and generator",

    tabDecode: "Decode",
    tabEncode: "Generate",
    tabVin: "VIN",
    tabLearn: "Dataset",

    family: "Family / Platform",
    familyHint: "Which ABS unit? Select by part number (e.g. 5Q0 614 517).",
    length: "Byte count",
    code: "Long coding",
    codePlaceholder: "e.g. 1E 07 6A 9C 34 23 23 74 …",
    decode: "Decode",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",
    source: "Source text",
    sourceNote: "This meaning comes verbatim from the source (referans / forum); it is not translated.",

    byte: "Byte",
    hex: "Hex",
    binary: "Binary",
    meaning: "Meaning",
    status: "Evidence",
    role: "Role",
    observedIn: "Seen on",
    mirrorOf: "Mirror of",
    mirrorOk: "Mirror OK",
    mirrorBad: "Mirror broken",
    mirrorExpected: "should be",
    noData: "No record found",
    tableEmpty: "(empty)",

    warnings: "Warnings",
    mirrorSummary: "Mirror check",
    mirrorPassed: "byte mirrors correct",
    error: "Error",
    wipedTitle: "Coding appears wiped",
    wipedBody:
      "All bytes are zero. This means the module lost its coding after a factory reset. " +
      "Get a donor coding from identical hardware and regenerate it with your own VIN.",

    encVehicle: "Vehicle / equipment",
    encVinCard: "VIN and base code",
    encVin: "VIN",
    encVinHint: "Chars 7, 8 and 13-17 are written into the code directly.",
    encDonor: "Donor coding",
    encDonorHint: "Unknown bytes are filled from this. Must be identical hardware.",
    encTail: "Tail block",
    encTailHint: "Byte 30+ varies by market. Auto = most common.",
    encGenerate: "Generate",
    encResult: "Generated coding",
    encApplied: "Applied bytes",
    encGaps: "Undetermined byte",
    encFromDonor: "Taken from donor",
    encMirrorAuto: "Mirrors computed automatically",
    encLength: "Code length",
    encSelVehicle: "Vehicle variant",
    encSelBrake: "Brake + side",
    encSelFront: "Front brake",
    encSelSteer: "Steering / ROP",
    encSelEpb: "EPB / start-up",
    encSelDrive: "Drivetrain",
    encSelEds: "EDS / tyre",
    encSelRear: "Rear brake",

    learnTitle: "Dataset and evidence levels",
    learnSchema: "Schema version",
    learnVersion: "Dataset version",
    learnFamilies: "Families",
    learnObs: "Real vehicle records",
    learnAdditions: "Added beyond referans",
    learnAccuracy: "Average accuracy",
    learnMirrorRule: "Mirror rule verification",
    learnTable: "Byte verification table",
    learnNote:
      "'Tested' does not mean the value works in VCDS. The tool only shows what the source states.",

    evTested: "Tested",
    evObserved: "From real cars",
    evUnconfirmed: "Not 100% confirmed",
    evUntested: "Untested",
    evUnknown: "Unknown",
    evUnclassified: "Unclassified",
    evNoDesc: "No description",
    evDerived: "Computed",

    disclaimer:
      "Back up the original coding before writing to a vehicle. " +
      "Even an accepted coding may leave fault codes.",
    footerWarn:
      "Back up the original coding before writing to a vehicle. Even an accepted coding may leave fault codes.",
    author: "Yapımcı: Samet Muriç",
    auto: "Auto",
    wordRecord: "records",
    famUnsupported: "generation off",

    /* --- Most common / auto fill --- */
    enSik: "Most common",
    enSikOf: "Most common (seen on %{n} vehicles)",
    autoFillHeader: "Automatically filled bytes",
    autoFillNote:
      "Some bytes are identical on every vehicle and were filled in without " +
      "input. The rest use the most common value — verify these before writing.",
    autoFillMirror: "mirror (computed)",
    autoFillConstant: "constant (same on every vehicle)",
    autoFillMostCommon: "most common value",
    autoFillDonor: "from donor code",
    autoFillSelection: "your selection",
    autoFillVin: "VIN",
    gapWarning:
      "%{n} bytes were estimated (most common value). Check these, or pick " +
      "a similar vehicle code.",
    donorOptional: "optional",
    donorHintNone:
      "Leave empty to use the most common value for unknown bytes.",
    donorPick: "Pick a similar vehicle",
    donorPickNone: "— my own code —",
    donorHint:
      "Use a real vehicle code from the same family as your base. Unknown " +
      "bytes are filled from it.",
    vinRequired: "VIN required",
    vinRequiredHint:
      "VIN bytes differ between vehicles in this family. A 17-character " +
      "VIN is needed to generate a code.",
    vinOptional: "VIN not required",
    vinOptionalHint:
      "VIN bytes are identical on every vehicle here, so a code can be " +
      "generated without a VIN.",
    byteHeader: "Byte",
    platformCodes: "Platform codes",
    /* Selection list statistics */
    optMostCommon: "most common on %{n}/%{m} vehicles",
    optAlso: "also",
    /* Dataset tab */
    learnUniqueCodes: "unique codes",
    learnPartial: "partial codings",
    learnMirrorRate: "mirror verification",
    learnMirrorHint:
      "Each family's mirror rule is tested against real vehicle codes. " +
      "The rule: the target byte is the bit-reversal of the source byte.",
    learnFamily: "Family",
    learnNoMirror: "no mirror",
    learnExceptions: "Known exceptions",
    learnExceptionsHint:
      "The only deviations found in the source data. The rule was not changed; " +
      "the record is kept as a note.",
    learnVehicle: "Vehicle",
    learnPart: "Part number",
    learnSources: "Sources",
    grpMk100: "MK100 / MQB - 29-48 bytes (156 vehicles)",
    grpCompact: "MK60EC1 / compact - 18-20 bytes (107 vehicles)",
    grpEsp9: "Bosch ESP9 - 31 bytes (10 vehicles)",
    grpPq46: "PQ46 / 2Q0 - 53-59 bytes (9 vehicles)",
    grpOther: "Other ABS modules (decode only)",
    role_vehicle_variant: "Vehicle",
    role_front_brake: "Front brake",
    role_brake_side: "Brake side",
    role_steering: "Steering",
    role_drivetrain: "Drive / transmission",
    role_tpms: "TPMS / tire",
    role_eds_tire: "EDS / tire",
    role_epb_startup: "EPB / startup",
    role_wheel_sensor: "Wheel sensor",
    role_hill_hold_engine: "Hill hold / engine",
    role_acc_front_assist: "ACC / front assist",
    wordRecommended: "recommended",
    wordBytes: "bytes",
    wordErrors: "errors",
    mirrorRuleUndefined: "Mirror rule undefined",
    codingModelCode: "Coding model code",
    vinModelUnknown: "VIN model code unknown",
    incomplete: "Incomplete",

    // VIN
    vinTitle: "VIN decode",
    vinDecode: "Decode VIN",
    vinPlaceholder: "TMBXXXXXXX389X89 (17 chars)",
    vinInvalid: "VIN must be 17 chars and must not use I/O/Q.",
    vinWmi: "Manufacturer (1-3)",
    vinModel: "Model (7-8)",
    vinYear: "Model year (10)",
    vinPlant: "Plant (11)",
    vinSerial: "Serial (12-17)",
    vinUnknownChar: "unknown",
    vinWmiVW: "Volkswagen Cars",
    vinPlantUnknown: "plant code not resolved",
    vinCheckDigit:
      "Europe / VW: position 9 is not a check digit - it is a filler 'Z'. " +
      "Source: clubvw.org.au/vwreference/vwvin/",
  },
};

/**
 * Cekirdek hata/warning kodlarini aktif dile cevirir.
 * Cekirdek dili BILMEZ; yalnizca { code, ...params } uretir.
 */
const ENC_MSG = {
  tr: {
    badValue: (p) => `Byte${p.byte}: geçersiz değer "${p.value}"`,
    mirrorMismatch: (p) => `ayna tutarsız: B${p.bytes.join(", B")}`,
    vinCharMissing: (p) =>
      `VIN ${p.digit}. karakter verilmedi (Byte${p.byte})` +
      (p.share != null ? ` — en sık değer %${p.share} kullanıldı` : ""),
    vinCharNotDigit: (p) =>
      `Byte${p.byte} yalnızca rakam kodlar (0-9), "${p.char}" rakam değil` +
      (p.share != null ? ` — en sık değer kullanıldı` : ""),
    vinCharNotInTable: (p) =>
      `VIN ${p.digit}. karakter "${p.char}" Byte${p.byte} tablosunda yok` +
      (p.share != null ? ` — en sık değer kullanıldı` : ""),
    manyGuessed: (p) => `${p.n} bayt en sık değerle dolduruldu — kontrol edin`,
    unresolvedBytes: (p) => `${p.n} bayt çözülemedi (0 yazıldı)`,
    generateUnsupported: () => "Bu ailede kod üretimi kapalı. Çözümleme yapabilirsiniz.",
    aileSecilmedi: () => "aile seçilmedi",
  },
  en: {
    badValue: (p) => `Byte${p.byte}: invalid value "${p.value}"`,
    mirrorMismatch: (p) => `mirror mismatch: B${p.bytes.join(", B")}`,
    vinCharMissing: (p) =>
      `VIN char ${p.digit} not given (Byte${p.byte})` +
      (p.share != null ? ` — most common value %${p.share} used` : ""),
    vinCharNotDigit: (p) =>
      `Byte${p.byte} only encodes digits (0-9), "${p.char}" is not a digit` +
      (p.share != null ? ` — most common value used` : ""),
    vinCharNotInTable: (p) =>
      `VIN char ${p.digit} "${p.char}" is not in the Byte${p.byte} table` +
      (p.share != null ? ` — most common value used` : ""),
    manyGuessed: (p) => `${p.n} bytes filled with the most common value — please check`,
    unresolvedBytes: (p) => `${p.n} bytes could not be resolved (written as 0)`,
    generateUnsupported: () => "Code generation is disabled for this family. You can still decode.",
    aileSecilmedi: () => "no family selected",
  },
};

/** Yapısal hata listesini dile cevrilmiş metin listesine donusturur. */
export function encodeMessages(lang, items) {
  const table = ENC_MSG[lang] || ENC_MSG.tr;
  return (items || []).map((it) => {
    const fn = table[it.code] || ENC_MSG.tr[it.code];
    if (fn) return fn(it);
    // bilinmeyen kod: parametreleri varsa goster
    return typeof it === "string" ? it : JSON.stringify(it);
  });
}

export function makeT(lang) {
  const dict = STR[lang] || STR.tr;
  /**
   * @param {string} k        anahtar
   * @param {object} [params] %{ad} yer tutucularini doldurur
   */
  return (k, params) => {
    let s = dict[k] ?? STR.tr[k] ?? k;
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        s = s.split("%{" + key + "}").join(val);
      }
    }
    return s;
  };
}

/** Aile etiketlerinin cevirileri (veri setinde kaynak dilinde yazili). */
export const FAMILY_LABELS = {
  tr: {
    MQB_MK100: "Continental MK100 - MQB (Golf, A3, Octavia, Superb, Tiguan)",
    PQ46_2Q0: "Continental ESC - PQ46/A0 (Polo, T-Cross, Scala, Kamiq)",
    MQB_A0_5WA: "Continental ESP - MQB-A0 (Caddy, Golf 8, Octavia IV)",
    BOSCH_ESP9_4M: "Bosch ESP9 - 4M (Audi Q8)",
    AUDI_8V: "Audi 8V0/8U0 (S3, RS3, RS Q3) - 46 bayt",
    AUDI_8S0: "Audi 8S0/8V0 (TT, TTS, TT RS) - 26 bayt",
    Q7_4M: "Audi Q7 4M - 14 bayt",
    T6_CADDY_19: "Continental MK100 - T6 / Caddy / Transporter - 19 bayt",
    MK60EC1: "Continental MK60EC1 - Golf 5/6, Octavia 2, Passat B7 - 20 bayt",
  },
  en: {
    MQB_MK100: "Continental MK100 - MQB (Golf, A3, Octavia, Superb, Tiguan)",
    PQ46_2Q0: "Continental ESC - PQ46/A0 (Polo, T-Cross, Scala, Kamiq)",
    MQB_A0_5WA: "Continental ESP - MQB-A0 (Caddy, Golf 8, Octavia IV)",
    BOSCH_ESP9_4M: "Bosch ESP9 - 4M (Audi Q8)",
    AUDI_8V: "Audi 8V0/8U0 (S3, RS3, RS Q3) - 46 bytes",
    AUDI_8S0: "Audi 8S0/8V0 (TT, TTS, TT RS) - 26 bytes",
    Q7_4M: "Audi Q7 4M - 14 bytes",
    T6_CADDY_19: "Continental MK100 - T6 / Caddy / Transporter - 19 bytes",
    MK60EC1: "Continental MK60EC1 - Golf 5/6, Octavia 2, Passat B7 - 20 bytes",
  },
};

/** Ayna dogrulama aciklamalarinin cevirileri. */
export const MIRROR_NOTES = {
  tr: {
    "727/728 gercek kodlama ile dogrulandi":
      "727 gerçek kodlama ile doğrulandı",
    "735/736 gercek kodlama ile dogrulandi":
      "735 gerçek kodlama ile doğrulandı",
    "komsu-swap haritasi, 5 arac ile dogrulandi":
      "Komşu-değişim haritası, 5 araç ile doğrulandı",
    "kayma 19 ile 8/8 dogrulandi":
      "19 kayması ile 8/8 doğrulandı",
    "0/40 - ayna kurali GECERLI DEGIL, harita bilinmiyor":
      "0/40 - ayna kuralı geçerli değil, harita bilinmiyor",
    "0/48 - ayna kurali gecerli degil, 14 bayt":
      "0/48 - ayna kuralı geçerli değil, 14 bayt",
    "kaynak koddan dogrulandi (bit-reversal), gercek arac gozlemi yok":
      "Kaynak koddan doğrulandı (bit çevirme), gerçek araç gözlemi yok",
    "kaynak koddan (mirroredByte0/2), gercek arac gozlemi yok":
      "Kaynak koddan doğrulandı, gerçek araç gözlemi yok",
    "referans metnine gore; gercek kodlama vagcode.info'da YOK":
      "referans metnine göre; gerçek kodlama kaynağında yok",
  },
  en: {
    "727/728 gercek kodlama ile dogrulandi":
      "verified on 727 real codings",
    "735/736 gercek kodlama ile dogrulandi":
      "verified on 735 real codings",
    "komsu-swap haritasi, 5 arac ile dogrulandi":
      "adjacent-swap map, verified on 5 vehicles",
    "kayma 19 ile 8/8 dogrulandi":
      "offset 19, verified 8/8",
    "0/40 - ayna kurali GECERLI DEGIL, harita bilinmiyor":
      "0/40 - mirror rule does NOT apply, map unknown",
    "0/48 - ayna kurali gecerli degil, 14 bayt":
      "0/48 - mirror rule does not apply, 14 bytes",
    "kaynak koddan dogrulandi (bit-reversal), gercek arac gozlemi yok":
      "verified from source code (bit-reversal), no real-vehicle data",
    "kaynak koddan (mirroredByte0/2), gercek arac gozlemi yok":
      "verified from source code, no real-vehicle data",
    "referans metnine gore; gercek kodlama vagcode.info'da YOK":
      "per referans text; no real coding in the source data",
  },
};

export function familyLabel(fid, lang, fallback) {
  return FAMILY_LABELS[lang]?.[fid] || FAMILY_LABELS.tr[fid] || fallback || fid;
}

export function mirrorNote(text, lang) {
  if (!text) return "";
  return MIRROR_NOTES[lang]?.[text] || text;
}

