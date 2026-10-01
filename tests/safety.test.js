import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDataset, MIN_SAMPLES, MIN_SHARE } from "../src/core/dataset.js";
import { encode } from "../src/core/encode.js";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(here, "../src/data/mk100_dataset.json");
let ds;

beforeAll(() => {
  ds = createDataset(JSON.parse(readFileSync(DATA, "utf8")));
});

/* ------------------------------------------------------------ uretim guvenligi
 *
 * Regresyon: Skoda Superb III 2019 (5Q0 614 517 DG, HW H62, SW 0654).
 * Onceki surumde encoder HW/SW bilmeden aile genelinin "en sik" degerlerini
 * kullaniyordu; 47 baytin 11'i bu araca ait degildi. ECU kodu reddetti.
 */
const FAMILY = "MQB_MK100";
const SUPERB_PN = "5Q0 614 517 DG";
const VIN = "TMBAG6NP6K7065566";

function truth() {
  return ds.observations.find((o) => o.part_number === SUPERB_PN);
}

function encodeFor(spec) {
  return encode(ds, {
    family: FAMILY, length: 47, selections: {}, equipment: {}, vin: VIN, ...spec,
  });
}

/** Ailenin gercek bir aracindan farkli olan, VIN disi baytlar. */
function wrongBytesVsTruth(r, t) {
  const vinIdx = new Set(ds.template(FAMILY).byte_template
    .filter((x) => x.kind === "vin").map((x) => x.index));
  const out = [];
  for (let i = 0; i < 47; i++) {
    if (vinIdx.has(i)) continue;
    const mine = r.bytes?.[i];
    if (mine == null) continue;
    if (mine.toString(16).toUpperCase().padStart(2, "0") !== t.bytes[i]) out.push(i);
  }
  return out;
}

describe("uretim guvenligi (HW/SW farkindalik)", () => {
  it("referans arac veri setinde mevcut", () => {
    const t = truth();
    expect(t).toBeTruthy();
    expect(t.hardware).toBe("H62");
    expect(t.software).toBe("0654");
    expect(t.family).toBe(FAMILY);
  });

  it("HW/SW verilmeden kod YAZILABILIR sayilmaz", () => {
    const r = encodeFor({});
    expect(r.ok).toBe(true);          // kod teknik olarak uretilir
    expect(r.writable).toBe(false);   // ama yazilabilir degildir
    expect(r.blocking).toContain("unverifiedBytes");
    expect(r.safety.uncertain.length).toBeGreaterThan(0);
  });

  it("HW verilince kapsam daralir, kayit sayisi bildirilir", () => {
    const r = encodeFor({ hw: "H62" });
    expect(r.safety.scope).toEqual({ hw: "H62", sw: null, partSeries: null });
    expect(r.safety.scopeMatched).toBeLessThan(r.safety.scopeTotal);
    expect(r.safety.filtered).toBe(true);
  });

  it("HW+SW verilince bu aracinin degerleri uretilir (0 gercek hata)", () => {
    const r = encodeFor({ hw: "H62", sw: "0654" });
    expect(wrongBytesVsTruth(r, truth())).toEqual([]);
  });

  it("ornek zayifsa (tek gozlem) yine de yazilabilir sayilmaz", () => {
    // HW+SW tek aracla eslesir: sonuc dogru olsa da istatistiksel temel yok.
    const r = encodeFor({ hw: "H62", sw: "0654" });
    expect(r.safety.scopeMatched).toBeLessThan(MIN_SAMPLES);
    expect(r.blocking).toContain("thinScopedSample");
    expect(r.writable).toBe(false);
  });

  it("olmayan HW icin gozlem yok uyarisi verir", () => {
    const r = encodeFor({ hw: "ZZ99" });
    expect(r.safety.scopeMatched).toBe(0);
    expect(r.blocking).toContain("noScopedObservations");
    expect(r.writable).toBe(false);
  });

  it("Vin baytlari her zaman VIN'e gore yazilir", () => {
    for (const spec of [{}, { hw: "H62" }, { hw: "H62", sw: "0654" }]) {
      const r = encodeFor(spec);
      const used = new Map((r.vin?.used || []).map((v) => [v.byte, v.char]));
      // VIN poz 13-17 = 6 5 5 6 6
      expect(used.get(5)).toBe("6");
      expect(used.get(7)).toBe("5");
      expect(used.get(9)).toBe("5");
      expect(used.get(11)).toBe("6");
      expect(used.get(13)).toBe("6");
    }
  });

  it("her senaryoda ayna kurali gecerli", () => {
    for (const spec of [{}, { hw: "H62" }, { hw: "H62", sw: "0654" }]) {
      const r = encodeFor(spec);
      expect(r.mirror.total).toBeGreaterThan(0);
      expect(r.mirror.ok).toBe(r.mirror.total);
    }
  });
});

describe("byteStats guven skoru", () => {
  it("guven esikleri disari acik", () => {
    expect(MIN_SAMPLES).toBeGreaterThan(1);
    expect(MIN_SHARE).toBeGreaterThan(0.5);
  });

  it("filtre verilince gozlem sayisi ve pay bildirir", () => {
    const all = ds.byteStats(FAMILY, 47);
    const h62 = ds.byteStats(FAMILY, 47, { hw: "H62" });
    expect(all[26].matched).toBeGreaterThan(h62[26].matched);
    expect(h62[26].filtered).toBe(true);
    expect(typeof h62[26].share).toBe("number");
    expect(typeof h62[26].reliable).toBe("boolean");
  });

  it("belirsiz deger guvenilmez isaretlenir", () => {
    // byte26 tum ailede iki deger arasinda paylasiliyor
    const s = ds.byteStats(FAMILY, 47)[26];
    expect(s.realDistinct).toBeGreaterThan(1);
    expect(s.reliable).toBe(false);
  });

  it("hardwareVersions aile icin HW/SW listeler", () => {
    const rows = ds.hardwareVersions(FAMILY);
    expect(rows.length).toBeGreaterThan(5);
    const h62 = rows.find((r) => r.hw === "H62");
    expect(h62).toBeTruthy();
    expect(h62.sw.length).toBeGreaterThan(3);
    expect(h62.count).toBeGreaterThan(10);
  });
});

describe("deger tablolari gozlemi kapsar", () => {
  it("Superb byte0 degeri tabloda var (daha once yoktu)", () => {
    const tpl = ds.template(FAMILY);
    const b0 = tpl.byte_template.find((x) => x.index === 0);
    expect(b0.values["1E"]).toBeTruthy();
    expect(b0.values["1E"].meaning).toMatch(/Superb/i);
    // gozlenen ama tabloda olmayan deger kalmamis olmali
    const stats = ds.byteValueStats(FAMILY, 0);
    for (const v of stats.keys()) expect(b0.values[v]).toBeTruthy();
  });

  it("ayna baytlarina gozlenen deger yazilmaz", () => {
    // Ayna bayti her zaman kaynaktan turer; deger tablosu tutarsiz olur.
    for (const fam of ds.familyIds()) {
      const tpl = ds.template(fam);
      if (!tpl) continue;
      for (const b of tpl.byte_template) {
        if (b.kind !== "mirror") continue;
        for (const rec of Object.values(b.values || {})) {
          expect(rec.status).not.toBe("observed");
        }
      }
    }
  });

  it("gozlenen degerler arac adini tasir", () => {
    const tpl = ds.template(FAMILY);
    const b0 = tpl.byte_template.find((x) => x.index === 0);
    const rec = b0.values["1E"];
    expect(rec.observed_in).toBeGreaterThan(1);
    expect(rec.meaning).toMatch(/Superb/);
  });
});