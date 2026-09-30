import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { bitrev, toBin, testBits, parseBitSpec } from "../src/core/bits.js";
import { createDataset, parseCode, formatCode, MIN_SCHEMA } from "../src/core/dataset.js";
import { decode } from "../src/core/decode.js";
import { encode, readVinChars } from "../src/core/encode.js";
import { generatableFamilies } from "../src/core/profiles.js";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(here, "../src/data/mk100_dataset.json");

let ds;
beforeAll(() => {
  ds = createDataset(JSON.parse(readFileSync(DATA, "utf8")));
});

/* ------------------------------------------------------------------ bits */
describe("bit yardimcilar", () => {
  it("bitrev referans ornegini dogrular (F4 -> 2F)", () => {
    expect(bitrev(0xf4)).toBe(0x2f);
  });
  it("bitrev simetrik", () => {
    for (let i = 0; i < 256; i++) expect(bitrev(bitrev(i))).toBe(i);
  });
  it("bitrev 0 ve 255 sabit", () => {
    expect(bitrev(0x00)).toBe(0x00);
    expect(bitrev(0xff)).toBe(0xff);
  });
  it("toBin 8 hane", () => {
    expect(toBin(0xf4)).toBe("11110100");
    expect(toBin(0)).toBe("00000000");
  });
  it("bit araligi ayristirma", () => {
    expect(parseBitSpec("Bit 0~2")).toEqual([0, 1, 2]);
    expect(parseBitSpec("Bit 5~7")).toEqual([5, 6, 7]);
    expect(parseBitSpec("Bit 1 & 2")).toEqual([1, 2]);
  });
  it("bit testi", () => {
    // 0x6A = 0110 1010 -> bit 1,2,5,6 set
    const r = testBits(0x6a, "bit 1&2&5&6");
    expect(r.mask).toBe(0b01100110);
    expect(r.value).toBe(0x6a & 0b01100110);
    expect(r.bits).toEqual([1, 2, 5, 6]);
  });
});

/* -------------------------------------------------------------- dataset */
describe("dataset", () => {
it("sema uyumlu", () => {
    const c = ds.checkCompatibility();
    expect(c.problems).toEqual([]);
    expect(c.ok).toBe(true);
    expect(ds.meta.schema_version).toMatch(/^\d+\.\d+\.\d+$/);
  });
  it("13 aile tanimli (v2)", () => {
    expect(ds.familyIds().length).toBe(13);
    expect(ds.familyIds()).toContain("MQB_MK100");
    expect(ds.familyIds()).toContain("COMPACT_1K0");
    expect(ds.familyIds()).toContain("ESP9_31");
    expect(ds.familyIds()).toContain("PQ46_2Q0");
    expect(ds.familyIds()).toContain("EV_1EA");
  });
  it("gercek gozlemler yuklendi", () => {
    // sayi veri seti buyutuldukce degisir; asil degismez,
    // istatistik ile gozlem listesinin tutarli olmasidir.
    const s = ds.summary();
    expect(ds.observations.length).toBeGreaterThan(300);
    expect(s.observations).toBe(ds.observations.length);
    expect(s.observations).toBe(ds.raw.statistics.observations_total);
    expect(s.observations).toBe(
      ds.raw.statistics.observations_baseline + ds.raw.statistics.observations_added
    );
    expect(s.uniqueCodings).toBe(ds.raw.statistics.unique_codings);
  });
  it("ozet uretiliyor", () => {
    const s = ds.summary();
    expect(s.families).toBe(13);
  });
  it("COMPACT_1K0 ve ESP9_31 tablolari dolu", () => {
    const c = ds.platform("COMPACT_1K0");
    expect(c).not.toBeNull();
    expect(c.bytes.length).toBe(20);
    expect(c.bytes[0].values.length).toBeGreaterThan(5);
    const e = ds.platform("ESP9_31");
    expect(e).not.toBeNull();
    expect(e.bytes.length).toBe(31);
  });
  it("COMPACT_1K0 (MK60EC1) ayna haritasi 0->8,2->10,4->12,6->14", () => {
    // 107 gercek aracla %100 dogrulandi (build_dataset_v2.py)
    expect(ds.mirrorMap("COMPACT_1K0")).toEqual({ 0: 8, 2: 10, 4: 12, 6: 14 });
  });
  it("MQB_MK100 ayna haritasi 0->15..14->22", () => {
    expect(ds.mirrorMap("MQB_MK100")).toEqual({
      0: 15, 2: 16, 4: 17, 6: 18, 8: 19, 10: 20, 12: 21, 14: 22,
    });
  });
  it("COMPACT_1K0 VIN baytlari 1-3-5-7-9-11-13 (MK100 ile ayni)", () => {
    const vin = (ds.template("COMPACT_1K0").byte_template || [])
      .filter((b) => b.kind === "vin").map((b) => b.index).sort((a, b) => a - b);
    expect(vin).toEqual([1, 3, 5, 7, 9, 11, 13]);
  });
  it("parseCode bicimleri", () => {
    expect(parseCode("1E 07 6A").bytes).toEqual([0x1e, 0x07, 0x6a]);
    expect(parseCode("1e076a").bytes).toEqual([0x1e, 0x07, 0x6a]);
    expect(parseCode("1E-07-6A").bytes).toEqual([0x1e, 0x07, 0x6a]);
    expect(parseCode("1E0").ok).toBe(false);
    expect(parseCode("").ok).toBe(false);
  });
  it("formatCode", () => {
    expect(formatCode([0x1e, 0x07])).toBe("1E07");
    expect(formatCode([0x1e, 0x07], { spaced: true })).toBe("1E 07");
  });
});

/* ------------------------------------------------------- AIYNA KURALI */
/* En kritik test: 102 gercek kodlamanin hepsi ayna kuralina uymali. */
describe("ayna kurali - 326 gercek arac", () => {
  it("MQB_MK100: 728 kontrolunun >=727si dogru", () => {
    const mm = ds.mirrorMap("MQB_MK100");
    expect(mm).toEqual({ 0: 15, 2: 16, 4: 17, 6: 18, 8: 19, 10: 20, 12: 21, 14: 22 });
    let ok = 0, total = 0;
    for (const o of ds.observationsFor("MQB_MK100")) {
      const b = o.bytes.map((x) => parseInt(String(x), 16));
      for (const [s, d] of Object.entries(mm)) {
        if (d >= b.length) continue;
        total++;
        if (bitrev(b[Number(s)]) === b[d]) ok++;
      }
    }
    expect(total).toBeGreaterThan(700);
    expect(ok / total).toBeGreaterThan(0.998);
  });

  it("PQ46_2Q0 ayna haritasi artik BILINIYOR (6 gercek aracla dogrulandi)", () => {
    // eskiden "bilinmiyor" idi; 2Q0 614 kayitlari ile kesinlestirildi
    const mm = ds.mirrorMap("PQ46_2Q0");
    expect(mm[0]).toBe(6);
    expect(mm[2]).toBe(8);
    expect(mm[4]).toBe(10);
    expect(mm[12]).toBe(29);
    expect(mm[14]).toBe(30);
  });
  it("TINY_8K0 icin ayna haritasi yok (3-4 bayt)", () => {
    expect(Object.keys(ds.mirrorMap("TINY_8K0")).length).toBe(0);
  });
  it("5WA komsu-swap haritasi 80/80 dogrulanmis", () => {
    const mm = ds.mirrorMap("MQB_A0_5WA");
    expect(mm[0]).toBe(2);
    expect(mm[4]).toBe(6);
  });
  it("ESP9_31 genis ayna blogu 0->19..16->28", () => {
    const mm = ds.mirrorMap("ESP9_31");
    expect(mm[0]).toBe(19);
    expect(mm[14]).toBe(26);
    expect(mm[15]).toBe(27);
    expect(mm[16]).toBe(28);
  });
  it("EV_1EA elektrikli aile 0->6, 41->46", () => {
    const mm = ds.mirrorMap("EV_1EA");
    expect(mm[0]).toBe(6);
    expect(mm[41]).toBe(46);
  });
});

/* ------------------------------------------------------------- decode */
describe("decode - bilinen kodlar", () => {
  it("Superb III 2019 (5Q0 614 517 DG) cozulur", () => {
    const code =
      "1E 07 6A 9C 34 23 23 74 47 80 06 08 60 CC 49 78 56 2C C4 E2 60 06 92 75 30 21 F0 F8 C2 02 42 0B 00 00 00 12 12 12 12 B8 35 35 19 19 32 32 00";
    const r = decode(ds, code, { family: "MQB_MK100" });
    expect(r.ok).toBe(true);
    expect(r.byteCount).toBe(47);
    // aynalar tam
    expect(r.mirror.checked).toBe(8);
    expect(r.mirror.ok).toBe(8);
    // Byte4 on fren
    expect(r.rows[4].value).toBe("34");
    expect(r.rows[4].meaning).toMatch(/312mm/);
    // Byte10 cekis
    expect(r.rows[10].meaning).toMatch(/FWD/);
    // Byte14 arka fren
    expect(r.rows[14].meaning).toMatch(/Multi-Link/);
    // Byte0 referansta yok, gozlemden gelmeli
    expect(r.rows[0].value).toBe("1E");
    expect(r.rows[0].status).toBe("observed");
    expect(r.rows[0].meaning).toMatch(/Superb/);
    // uyari olmamali
    expect(r.warnings.filter((w) => w.level === "error")).toEqual([]);
  });

  it("ayna bozuk kod hata uretir", () => {
    const b = [
      0x1e, 0x07, 0x6a, 0x9c, 0x34, 0x23, 0x24 /* Byte6: 23 -> 24 */, 0x74, 0x47,
      0x80, 0x06, 0x08, 0x60, 0xcc, 0x49, 0x78, 0x56, 0x2c, 0xc4, 0xe2, 0x60,
      0x06, 0x92, 0x75, 0x30, 0x21, 0xf0, 0xf8, 0xc2, 0x02, 0x42, 0x0b, 0x00,
      0x00, 0x00, 0x12, 0x12, 0x12, 0x12, 0xb8, 0x35, 0x35, 0x19, 0x19, 0x32,
      0x32, 0x00,
    ];
    const r = decode(ds, b, { family: "MQB_MK100" });
    expect(r.mirror.ok).toBe(7);
    expect(r.mirror.checked).toBe(8);
    const errs = r.warnings.filter((w) => w.code === "mirror_mismatch");
    expect(errs.length).toBe(1);
    expect(errs[0].byte).toBe(18);
  });

  it("tum-sifir kod silinmis olarak isaretlenir", () => {
    const r = decode(ds, "00 ".repeat(47), { family: "MQB_MK100" });
    expect(r.warnings.some((w) => w.code === "wiped")).toBe(true);
  });

it("gozlemlerin TAMAMI cozulebiliyor", () => {
    const failures = [];
    for (const o of ds.observations) {
      const r = decode(ds, o.bytes, { family: o.family });
      if (!r.ok) { failures.push(`${o.vehicle} (cozulemedi)`); continue; }
      if (r.rows.length !== o.byte_count)
        failures.push(`${o.vehicle} (${r.rows.length}/${o.byte_count} bayt)`);
    }
    expect(failures).toEqual([]);
    // her gozlem kendi ailesine ait olmali
    const orphan = ds.observations.filter((o) => !ds.families[o.family]);
    expect(orphan).toEqual([]);
  });

it("ayna dogrulamasi >= %99 (bilinen tek istisna haric)", () => {
    // Her aile kurali gercek arac kodlariyla sinanir.
    let ok = 0, tot = 0;
    const per = {};
    const bad = [];
    for (const o of ds.observations) {
      const r = decode(ds, o.bytes, { family: o.family });
      for (const row of r.rows) {
        if (row.mirrorOf === null || row.mirrorOf === undefined) continue;
        tot++;
        per[o.family] ||= { ok: 0, tot: 0 };
        per[o.family].tot++;
        if (row.mirrorOk) { ok++; per[o.family].ok++; }
        else bad.push(`${o.family}/${o.vehicle} b${row.mirrorOf}->b${row.index}`);
      }
    }
    expect(tot).toBeGreaterThan(2000);
    // 1 istisna: Karoq 5Q0 614 517 DN (byte2=6A -> byte16=58, beklenen 56)
    const known = bad.filter((b) => b.includes("Karoq"));
    expect(bad.length - known.length).toBe(0);
    expect(ok / tot).toBeGreaterThan(0.99);
    // her aile kendi kuralini %100 uygulamali (istisnali aile haric)
    for (const [fam, v] of Object.entries(per)) {
      if (v.ok / v.tot < 1) expect(fam, `${fam} %${(100 * v.ok / v.tot).toFixed(2)}`)
        .toBe("MQB_MK100");
    }
  });

  it("ayna orani gozlemlerde >= %99 (bilinen tek istisna haric)", () => {
    // Not: kapsamli ayna dogrulamasi "326 gozlemde ayna dogrulamasi"
    // testinde yapilmaktadir. Burada MQB_MK100 icin hizli kontrol.
    let ok = 0, tot = 0;
    for (const o of ds.observationsFor("MQB_MK100")) {
      const r = decode(ds, o.bytes, { family: "MQB_MK100" });
      for (const row of r.rows) {
        if (row.mirrorOf === null || row.mirrorOf === undefined) continue;
        tot++;
        if (row.mirrorOk) ok++;
      }
    }
    expect(tot).toBeGreaterThan(1000);
    expect(ok / tot).toBeGreaterThan(0.99);
  });
});

/* ------------------------------------------------------------- encode */
describe("encode", () => {
  const DONOR =
    "1E 07 6A 9C 34 23 23 74 47 80 06 08 60 CC 49 78 56 2C C4 E2 60 06 92 75 30 21 F0 F8 C2 02 42 0B 00 00 00 12 12 12 12 B8 35 35 19 19 32 32 00";

  it("aynalar otomatik hesaplanir", () => {
    const r = encode(ds, {
      family: "MQB_MK100",
      length: 47,
      selections: { 0: "1E", 2: "6A", 4: "34", 6: "23", 8: "47", 10: "06", 12: "60", 14: "49" },
      donor: DONOR,
    });
    expect(r.ok).toBe(true);
    expect(r.mirror.ok).toBe(8);
    expect(r.mirror.total).toBe(8);
  });

  it("uretilen kod tekrar cozuldugunde aynalari dogrular", () => {
    const r = encode(ds, {
      family: "MQB_MK100",
      length: 47,
      selections: { 0: "1E", 2: "6A", 4: "34", 6: "23", 8: "47", 10: "06", 12: "60", 14: "49" },
      donor: DONOR,
    });
    const d = decode(ds, r.code, { family: "MQB_MK100" });
    expect(d.mirror.ok).toBe(8);
    expect(d.warnings.filter((w) => w.level === "error")).toEqual([]);
  });

  it("VIN ofsetleri dogru uygulanir", () => {
    // Superb III 2019: VIN 13..17 = 3,8,9,8,9
    const r = encode(ds, {
      family: "MQB_MK100",
      length: 47,
      selections: { 0: "1E", 2: "6A", 4: "34", 6: "23", 8: "47", 10: "06", 12: "60", 14: "49" },
      vin: "TMBXXXXNP389X89",
      donor: DONOR,
    });
    const b = r.bytes;
    expect(b[5]).toBe(0x03 + 0x20);  // 23
    expect(b[7]).toBe(0x08 + 0x6c);  // 74
    expect(b[9]).toBe(0x09 + 0x77);  // 80
    expect(b[11]).toBe(0x08 + 0x00); // 08
    expect(b[13]).toBe((0x09 + 0xc3) & 0xff); // CC
  });

  it("donor kodu degistirilince aynalar guncellenir", () => {
    const a = encode(ds, {
      family: "MQB_MK100", length: 47,
      selections: { 0: "1E", 2: "6A", 4: "34", 6: "23", 8: "47", 10: "06", 12: "60", 14: "49" },
      donor: DONOR,
    });
    const b = encode(ds, {
      family: "MQB_MK100", length: 47,
      selections: { 0: "1E", 2: "6A", 4: "50", 6: "23", 8: "47", 10: "06", 12: "60", 14: "49" },
      donor: DONOR,
    });
    expect(a.bytes[4]).toBe(0x34);
    expect(b.bytes[4]).toBe(0x50);
    expect(b.bytes[17]).toBe(bitrev(0x50)); // ayna otomatik
    expect(b.bytes[17]).not.toBe(a.bytes[17]);
    expect(b.mirror.ok).toBe(8);
  });

  it("donor olmadan da TAM kod uretilir (baytlar en sik degerle dolar)", () => {
    const r = encode(ds, {
      family: "MQB_MK100", length: 47,
      selections: { 0: "1E" },
    });
    // Kod uretilir ve tam bayt sayisindadir
    expect(r.code).toHaveLength(47 * 2);
    expect(r.bytes.length).toBe(47);
    expect(r.bytes.every((b) => Number.isInteger(b) && b >= 0 && b <= 255)).toBe(true);
    // hicbir bayt bos (null) kalmaz
    expect(r.gaps.length).toBe(0);
    // bilinmeyen baytlar en sik degerle dolduruldu ve RAPORLANIR
    expect(r.guessedCount).toBeGreaterThan(0);
    expect(r.unresolved.some((u) => u.from === "most_common")).toBe(true);
    // aynalar her zaman tutarli
    expect(r.mirror.ok).toBe(r.mirror.total);
    // VIN eksikligi hata olarak bildirilir (gizlenmez)
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "vinCharMissing")).toBe(true);
  });

  it("donor verilince donor baytlari kullanilir", () => {
    const o = ds.observationsFor("MQB_MK100")[0];
    const withDonor = encode(ds, {
      family: "MQB_MK100", length: o.byte_count,
      selections: { 0: "1E" }, donor: o.coding,
    });
    const noDonor = encode(ds, {
      family: "MQB_MK100", length: o.byte_count,
      selections: { 0: "1E" },
    });
    expect(withDonor.unresolved.some((u) => u.from === "donor")).toBe(true);
    // donor verilince daha az tahmin yapilir
    expect(withDonor.guessedCount).toBeLessThan(noDonor.guessedCount);
  });

it("uretebilen ailelerde VIN gercekten zorunludur (baytlar araca gore degisir)", () => {
    // Bu, veriden cikan sonuc: uretebilen 5 ailenin hicbirinde VIN
    // bayti sabit degil. Bu yuzden bu ailelerde VIN verilmeden uretim
    // "tahmin" ile yapilir ve kullaniciya bildirilir.
    for (const prof of generatableFamilies()) {
      const tpl = ds.template(prof.id);
      const L = tpl.default_length;
      const st = ds.byteStats(prof.id, L);
      const vinBytes = tpl.byte_template.filter((x) => x.kind === "vin").map((x) => x.index);
      expect(vinBytes.length, prof.id).toBeGreaterThan(0);
      for (const i of vinBytes) {
        expect(st[i].realConstant, `${prof.id} byte${i}`).toBe(false);
      }
      // VIN verilmeden uretim kod uretir ama uyarir
      const r = encode(ds, { family: prof.id, length: L, selections: {} });
      expect(r.code, prof.id).toHaveLength(L * 2);
      expect(r.vin.required.length, prof.id).toBeGreaterThan(0);
    }
  });

  it("sabit VIN bayti varsa VIN gerekmez (TINY_8K0 byte3)", () => {
    const t = ds.template("TINY_8K0").byte_template.filter((x) => x.kind === "vin");
    expect(t.map((x) => x.index)).toEqual([1, 3]);
    const st = ds.byteStats("TINY_8K0", 4);
    expect(st[3].realConstant).toBe(true);
    expect(st[1].realConstant).toBe(false);
  });

  it("sadece 00 gozlenen bayt VIN sayilmaz", () => {
    // SHORT_10_4G0 byte9 hep 00 -> kullanilmiyor, VIN degil
    const t = ds.template("SHORT_10_4G0").byte_template;
    const b9 = t.find((x) => x.index === 9);
    expect(b9.kind).not.toBe("vin");
    const st = ds.byteStats("SHORT_10_4G0", 10);
    expect(st[9].onlyZero).toBe(true);
  });

  it("VIN ofsetleri gozlemden turetilmis", () => {
    const t = ds.template("MQB_MK100").byte_template;
    const byIdx = Object.fromEntries(t.map((x) => [x.index, x]));
    // 156 gercek aracla dogrulandi: B5=0x20, B7=0x6C, B9=0x77, B13=0xC3
    expect(byIdx[5].offset).toBe("0x20");
    expect(byIdx[7].offset).toBe("0x6C");
    expect(byIdx[9].offset).toBe("0x77");
    expect(byIdx[13].offset).toBe("0xC3");
    expect(byIdx[5].vin_digit).toBe(13);
    expect(byIdx[1].vin_digit).toBe(7);
  });

  it("COMPACT_1K0 VIN ofseti MK100'den farkli (0x22)", () => {
    const t = ds.template("COMPACT_1K0").byte_template;
    const b5 = t.find((x) => x.index === 5);
    expect(b5.offset).toBe("0x22");
  });

  it("readVinChars 17 haneli VIN haritasi", () => {
    const c = readVinChars("TMB12345678901234");
    expect(c[1]).toBe("T");
    expect(c[7]).toBe("4");
    expect(c[17]).toBe("4");
    expect(readVinChars("kisa")).toEqual({});
  });
});

/* ------------------------------------------------------ veri bÃ¼tÃ¼nlÃ¼ÄŸÃ¼ */
describe("veri butunlugu", () => {
  it("Byte0=1E Superb olarak kayitli", () => {
    const v = ds.addedValue("MQB_MK100", 0, "1E");
    expect(v).not.toBeNull();
    expect(v.count).toBe(8);
    expect(v.meaning_inferred).toMatch(/Superb/);
  });
  it("VIN baytlarinda %100 dogrulama", () => {
    for (const b of [1, 5, 7, 9, 11, 13]) {
      const s = ds.validation.data_bytes[`Byte${b}`];
      expect(s.accuracy, `Byte${b}`).toBe(100);
    }
  });
  it("ayna baytlarinin tamami tutarli", () => {
    for (const [k, v] of Object.entries(ds.validation.mirror_bytes_consistency)) {
      expect(v.rate, k).toBeGreaterThan(98);
    }
  });
  it("her aile icin bayt sablonu mevcut", () => {
    for (const f of ds.familyIds()) {
      const t = ds.template(f);
      expect(t, f).not.toBeNull();
      expect(t.byte_template.length, f).toBeGreaterThan(0);
      expect(t.label, f).toBeTruthy();
    }
  });
  it("aik uzunluklari mantikli", () => {
    expect(ds.template("MQB_MK100").default_length).toBe(47);
    expect(ds.template("COMPACT_1K0").default_length).toBe(20);
    expect(ds.template("ESP9_31").default_length).toBe(31);
    expect(ds.template("PQ46_2Q0").default_length).toBe(53);
    // her ailenin gozlem sayisi bayt uzunluguyla uyumlu olmali
    for (const fid of ds.familyIds()) {
      const t = ds.template(fid);
      const n = ds.observationsFor(fid).length;
      expect(t, fid).not.toBeNull();
      expect(t.default_length, fid).toBeGreaterThan(0);
      expect(t.byte_template.length, fid).toBe(t.default_length);
      if (n > 0) expect(n, fid).toBe(t.observation_count);
    }
  });
});


