/**
 * 13 AILE (family_registry.py) - her aile kendi motoruyla.
 *
 * Ayna kurallari 326 GERCEK arac koduyla dogrulanmistir
 * (tools/build_dataset_v2.py -> mirror_verified).
 */

export const PROFILES = {
  MQB_MK100: {
    id: "MQB_MK100", engine: "mk100", group: "mk100",
    byteCount: 47, altLengths: [29, 30, 31, 47, 48], supported: true,
    vehicles: "Golf 7/8, Passat B8, Tiguan, T-Roc, Arteon, Atlas, Octavia III/IV, Superb III, Karoq, Kodiaq, A3 8V/8Y, A4 B9, A6 8X, A7, A8, Q2, Q3, Q5, TT 8S, LEON",
    noteKey: "mk100_main",
  },
  MQB_A0_5WA: {
    id: "MQB_A0_5WA", engine: "mk100", group: "mk100",
    byteCount: 35, altLengths: [35], supported: true,
    vehicles: "Caddy T7, Transporter T7, Caravelle T7, Golf A8, Atlas, Octavia IV",
    noteKey: "mirror_adjacent_swap",
  },
  MQB_44: {
    id: "MQB_44", engine: "mk100", group: "mk100",
    byteCount: 44, altLengths: [44], supported: false,
    vehicles: "Karoq (44 bayt varyant)", noteKey: "single_record",
  },
  EV_1EA: {
    id: "EV_1EA", engine: "mk100", group: "mk100",
    byteCount: 47, altLengths: [47], supported: false,
    vehicles: "ID.3, ID.4, ID.4 SUV, Enyaq iV", noteKey: "ev_wide_mirror",
  },
  COMPACT_1K0: {
    id: "COMPACT_1K0", engine: "mk60ec1", group: "compact",
    byteCount: 20, altLengths: [18, 19, 20], supported: true,
    vehicles: "Golf 5/6, Golf Plus, Golf Variant, Golf Cabrio, Jetta, Touran, Octavia II, Superb II, Passat B7, Passat NMS, A3 8P, ALTEA, Yeti, Roomster, Ibiza, Polo, Fox, Touareg, Citigo, Rapid",
    noteKey: "mk60ec1_differs",
  },
  COMPACT_15: {
    id: "COMPACT_15", engine: "compact15", group: "compact",
    byteCount: 15, altLengths: [15], supported: false,
    vehicles: "Amarok, Transporter T6", noteKey: "no_mirror_found",
  },
  ESP9_31: {
    id: "ESP9_31", engine: "esp9", group: "esp9",
    byteCount: 31, altLengths: [31], supported: true,
    vehicles: "A4 8W, A4 Avant, A5, A5 Cabriolet, A7 Sportback, A8, Q7 4M, Q8",
    noteKey: "esp9_offset19",
  },
  PQ46_2Q0: {
    id: "PQ46_2Q0", engine: "pq46", group: "pq46",
    byteCount: 53, altLengths: [53], supported: true,
    vehicles: "Polo, Polo Virtus, Ibiza, Rapid NH Spaceback",
    noteKey: "pq46_twin_block",
  },
  PQ46_59: {
    id: "PQ46_59", engine: "pq46", group: "pq46",
    byteCount: 59, altLengths: [59], supported: false,
    vehicles: "Skoda Scala, VW T-Cross", noteKey: "pq46_short_tail",
  },
  SHORT_24_5N0: {
    id: "SHORT_24_5N0", engine: "generic", group: "other",
    byteCount: 24, altLengths: [24], supported: false,
    vehicles: "Sharan, Q3 8U, Passat NMS", noteKey: "three_records",
  },
  SHORT_10_4G0: {
    id: "SHORT_10_4G0", engine: "generic", group: "other",
    byteCount: 10, altLengths: [10], supported: false,
    vehicles: "A6 C8, A7 Sportback 4G, A8 4H", noteKey: "short_layout",
  },
  TINY_8K0: {
    id: "TINY_8K0", engine: "generic", group: "other",
    byteCount: 4, altLengths: [3, 4], supported: false,
    vehicles: "A4 8K, A4 Avant, Q5 8R, A5 8T", noteKey: "tiny_no_mirror",
  },
  SINGLE_26_6C0: {
    id: "SINGLE_26_6C0", engine: "generic", group: "other",
    byteCount: 26, altLengths: [26], supported: false,
    vehicles: "Polo (Rusya)", noteKey: "single_record",
  },
};

export const PROFILE_NOTES = {
  tr: {
    mk100_main:
      "MK100 ana aile. Ayna kuralı 0→15, 2→16, 4→17, 6→18, 8→19, 10→20, 12→21, 14→22 " +
      "156 gerçek araçta doğrulandı (1 istisna: Karoq 5Q0 614 517 DN).",
    mirror_adjacent_swap:
      "Bu aile komşu-değişim aynası kullanır (0↔2, 4↔6, 14↔15).",
    single_record: "Bu aile için yalnızca 1 gerçek kayıt doğrulandı.",
    mk60ec1_differs:
      "MK60EC1 farklı bir modüldür: ayna kuralı 0→8, 2→10, 4→12, 6→14 " +
      "(MK100'de 15-22). VIN baytları 1-3-5-7-9-11-13. 107 araçta %100 doğrulandı.",
    no_mirror_found: "Bu ailede ayna kuralı bulunamadı. Yalnızca çözümleme yapılır.",
    esp9_offset19: "Bosch ESP9: aynalar 19-28 aralığında (15→27, 16→28 dahil).",
    pq46_twin_block: "PQ46 ikili blok: 0→6, 2→8, 4→10, ardından 12→29, 14→30, 15→31…",
    pq46_short_tail: "PQ46'nın 59 baytlık varyantı: kuyruk 45→49, 46→50, 47→51, 53→56.",
    three_records: "Yalnızca 3 gerçek kayıt doğrulandı.",
    short_layout: "Kısa 10 baytlık yapı: yalnızca 0→4 aynası.",
    tiny_no_mirror: "3-4 baytlık çok kısa yapı; ayna baytı yoktur.",
    ev_wide_mirror: "Elektrikli araç varyantı: ayna blokları çok geniş (0→6 … 41→46).",
    generateUnsupported: "Bu ailede kod üretimi kapalı. Çözümleme yapabilirsiniz.",
  },
  en: {
    mk100_main:
      "Main MK100 family. Mirror rule 0→15, 2→16, 4→17, 6→18, 8→19, 10→20, 12→21, 14→22 " +
      "verified on 156 real vehicles (one exception: Karoq 5Q0 614 517 DN).",
    mirror_adjacent_swap:
      "This family uses an adjacent-swap mirror (0↔2, 4↔6, 14↔15).",
    single_record: "Only 1 real record verified for this family.",
    mk60ec1_differs:
      "MK60EC1 is a different module: mirror rule 0→8, 2→10, 4→12, 6→14 " +
      "(MK100 uses 15-22). VIN bytes 1-3-5-7-9-11-13. Verified 100% on 107 vehicles.",
    no_mirror_found: "No mirror rule found for this family. Decode only.",
    esp9_offset19: "Bosch ESP9: mirrors sit at 19-28 (including 15→27, 16→28).",
    pq46_twin_block: "PQ46 twin block: 0→6, 2→8, 4→10, then 12→29, 14→30, 15→31…",
    pq46_short_tail: "PQ46 59-byte variant: tail 45→49, 46→50, 47→51, 53→56.",
    three_records: "Only 3 real records verified.",
    short_layout: "Short 10-byte layout: only the 0→4 mirror.",
    tiny_no_mirror: "Very short 3-4 byte layout; no mirror bytes.",
    ev_wide_mirror: "EV variant: very wide mirror blocks (0→6 … 41→46).",
    generateUnsupported: "Code generation is disabled for this family. You can still decode.",
  },
};

export function getProfile(familyId) {
  return PROFILES[familyId] || {
    id: familyId, engine: "generic", group: "other",
    byteCount: 0, altLengths: [], supported: false, noteKey: "single_record",
  };
}

export function generatableFamilies() {
  return Object.values(PROFILES).filter((p) => p.supported);
}

export function engineFor(familyId) {
  return getProfile(familyId).engine;
}
