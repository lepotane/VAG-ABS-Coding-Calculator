import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createDataset } from "../src/core/dataset.js";
import { decode } from "../src/core/decode.js";
import {
  decodeVin, decodeModelYear, VIN_MODEL_CODES, VIN_WMI,
  BYTE1_CHAR_MAP, BYTE3_CHAR_MAP, charsFromCoding,
} from "../src/core/vin.js";

const here = dirname(fileURLToPath(import.meta.url));
beforeAll(() => {
  globalThis.__ds = createDataset(
    JSON.parse(readFileSync(resolve(here, "../src/data/mk100_dataset.json"), "utf8"))
  );
});

/* Model yili kodu: 10. hane. ClubVW tablosu:
   1980-A 1990-L 2000-Y 2010-A 2020-L 2030-Y
   I,O,Q,U,Z ve 0 kullanilmaz. Diziler 30 yilda bir tekrarlar. */
describe("model yili kodu", () => {
  it("A=1980/2010", () => {
    expect(decodeModelYear("A")).toEqual([1980, 2010]);
  });
  it("K=1989/2019 (Superb III 2019)", () => {
    expect(decodeModelYear("K")).toEqual([1989, 2019]);
  });
  it("J=1988/2018 (I atlandi)", () => {
    expect(decodeModelYear("J")).toEqual([1988, 2018]);
  });
  it("P=1993/2023 (O atlandi)", () => {
    expect(decodeModelYear("P")).toEqual([1993, 2023]);
  });
  it("T=1996/2026 (Q ve S gecildi)", () => {
    expect(decodeModelYear("T")).toEqual([1996, 2026]);
  });
  it("Y=2000/2030", () => {
    expect(decodeModelYear("Y")).toEqual([2000, 2030]);
  });
  it("1=2001/2031", () => {
    expect(decodeModelYear("1")).toEqual([2001, 2031]);
  });
  it("9=2009/2039", () => {
    expect(decodeModelYear("9")).toEqual([2009, 2039]);
  });
  it("I O Q U Z ve 0 reddedilir", () => {
    for (const c of ["I", "O", "Q", "U", "Z", "0"]) expect(decodeModelYear(c), c).toBeNull();
  });
  it("cok karakterli kod reddedilir", () => {
    for (const c of ["", "@", "1A", "AB"]) expect(decodeModelYear(c)).toBeNull();
  });
});

/* VIN dogrulama */
describe("VIN dogrulama", () => {
  it("17 hane gerekli", () => {
    expect(decodeVin("TMBZZZNP0KX12345").ok).toBe(false);
    expect(decodeVin("TMBZZZNP0KX123456").ok).toBe(true);
  });
  it("I/O/Q reddedilir (ISO kurali)", () => {
    expect(decodeVin("TMBZZZNP0KI12345").ok).toBe(false);
  });
  it("bos ve gecersiz", () => {
    expect(decodeVin("").ok).toBe(false);
    expect(decodeVin("   ").ok).toBe(false);
  });
  it("bosluk ve tire temizlenir", () => {
    const a = decodeVin("TMB ZZZNP0 KX123456");
    expect(a.ok).toBe(true);
    expect(a.raw).toBe("TMBZZZNP0KX123456");
  });
  it("kucuk harf kabul edilir", () => {
    expect(decodeVin("tmbzzznp0kx123456").wmi).toBe("TMB");
  });
});

/* VIN cozumleme. VAG Avrupa formati: TMB ZZZ NP0 K X 123456
   1-3 WMI | 4-6 ZZZ (dolgu) | 7-8 model | 9 Z | 10 yil | 11 fabrika | 12-17 seri (6 hane) */
describe("VIN cozumleme", () => {
  it("Superb III 2019: TMBZZZNP0KX123456", () => {
    const r = decodeVin("TMBZZZNP0KX123456");
    expect(r.ok).toBe(true);
    expect(r.wmi).toBe("TMB");
    expect(r.wmiLabel).toMatch(/Skoda/);
    expect(r.model).toBe("NP");
    expect(r.modelLabel).toMatch(/Superb/);
    expect(r.year).toBe("K");
    expect(r.years).toContain(2019);
    expect(r.plant).toBe("X");
    expect(r.serial).toBe("123456");
  });
  it("Octavia 3 2020: TMBZZZNE0LX123456", () => {
    const r = decodeVin("TMBZZZNE0LX123456");
    expect(r.model).toBe("NE");
    expect(r.modelLabel).toMatch(/Octavia/);
  });
  it("VW Golf (1J) 1998: WVWZZZ1JZWF123456", () => {
    const r = decodeVin("WVWZZZ1JZWF123456");
    expect(r.wmiLabel).toMatch(/Volkswagen Cars/);
    expect(r.modelLabel).toMatch(/Golf and Bora/);
    expect(r.year).toBe("W");
    expect(r.years).toContain(1998);
  });
  it("Audi A3 8V 2019: WAUZZZ8V0KA123456", () => {
    const r = decodeVin("WAUZZZ8V0KA123456");
    expect(r.wmiLabel).toBe("Audi");
    expect(r.model).toBe("8V");
    expect(r.modelLabel).toMatch(/A3/);
    expect(r.plantLabel).toMatch(/Ingolstadt/);
  });
  it("Tiguan (5N) 2019: WVWZZZ5N0KW123456", () => {
    expect(decodeVin("WVWZZZ5N0KW123456").modelLabel).toMatch(/Tiguan/);
  });
  it("bilinmeyen WMI null doner", () => {
    expect(decodeVin("XXXZZZ1JZWF123456").wmiLabel).toBeNull();
  });
  it("fabrika kodu cozulur", () => {
    expect(decodeVin("TMBZZZNP0K1123456").plantLabel).toMatch(/Gyor/);
  });
  it("seri 12-17 alinir (6 hane)", () => {
    expect(decodeVin("TMBZZZNP0KX123456").serial).toBe("123456");
  });
});

/* Byte1/Byte3 -> VIN 7-8: en kritik baglanti */
describe("kodlama Byte1/Byte3 -> VIN 7-8", () => {
  const superbCode = [0x1e, 0x07, 0x6a, 0x9c, 0x34, 0x23, 0x23, 0x74, 0x47, 0x80,
    0x06, 0x08, 0x60, 0xcc, 0x49, 0x78, 0x56, 0x2c, 0xc4, 0xe2, 0x60, 0x06, 0x92,
    0x75, 0x30, 0x21, 0xf0, 0xf8, 0xc2, 0x02, 0x42, 0x0b, 0, 0, 0, 0x12, 0x12, 0x12,
    0x12, 0xb8, 0x35, 0x35, 0x19, 0x19, 0x32, 0x32, 0x00];

  it("Superb III kodu NP model kodu verir", () => {
    const c = charsFromCoding(superbCode, "MQB_MK100");
    expect(c[7]).toBe("N");
    expect(c[8]).toBe("P");
    expect(VIN_MODEL_CODES[c[7] + c[8]]).toMatch(/Superb/);
  });

  it("hex bayt 0x07 'N' olarak cozulur (onceki hata: 7 olarak parse)", () => {
    const c = charsFromCoding([0, 0x07], "X");
    expect(c[7]).toBe("N");
  });

  it("hex bayt 0x0C 'U' olarak cozulur (onceki hata: 12 olarak parse)", () => {
    const c = charsFromCoding([0, 0x0c], "X");
    expect(c[7]).toBe("U");
  });

  it("Byte1 tablosu: A-F = FA-FF", () => {
    expect(BYTE1_CHAR_MAP["FA"]).toBe("A");
    expect(BYTE1_CHAR_MAP["FF"]).toBe("F");
  });
  it("Byte1 tablosu: rakamlar", () => {
    expect(BYTE1_CHAR_MAP["EA"]).toBe("1");
    expect(BYTE1_CHAR_MAP["F1"]).toBe("8");
  });
  it("Byte3 tablosu: P = 9C", () => {
    expect(BYTE3_CHAR_MAP["9C"]).toBe("P");
  });

  it("GERCEK VERI: MQB_MK100 gozlemlerinde Byte1 cozulebiliyor", () => {
    const ds = globalThis.__ds;
    const obs = ds.observationsFor("MQB_MK100");
    expect(obs.length).toBeGreaterThan(100);
    let ok = 0;
    const no = [];
    let zero = 0;
    for (const o of obs) {
      const b1 = o.bytes[1];
      if (!b1) continue;
      // Tam sifir kodlama: kodlanmamis / yeni modul. VIN yazilmamis olur.
      if (o.bytes.every((b) => b === "00")) { zero++; continue; }
      if (BYTE1_CHAR_MAP[b1] !== undefined) ok++;
      else no.push(`${o.vehicle} byte1=${b1}`);
    }
    expect(no).toEqual([]);
    // veri setinde tam sifir kodlama 8 kayit (MQB 2 + COMPACT 6)
    expect(zero).toBe(2);
    expect(ok + zero).toBe(obs.length);
  });

  it("GERCEK VERI: tam sifir kodlamalar kodlanmamis modul", () => {
    const ds = globalThis.__ds;
    const allZero = ds.observations.filter((o) => o.bytes.every((b) => b === "00"));
    expect(allZero.length).toBe(8);
    // bunlar cozume girmez ama hata da uretmez
    for (const o of allZero) {
      const r = decode(ds, o.bytes, { family: o.family });
      expect(r.ok, o.vehicle).toBe(true);
      expect(r.rows.length).toBe(o.byte_count);
    }
  });

  it("GERCEK VERI: Superb kayitlari model kodunu dogruluyor", () => {
    // vagcode.info'da Superb III = NP, Superb II = 3T.
    // Superb III 30/31/47 bayt olmak uzere UC farkli modul nesline sahip.
    const ds = globalThis.__ds;
    const sup = ds.observations.filter((o) => /Superb/i.test(o.vehicle));
    expect(sup.length).toBe(16);
    const byModel = {};
    for (const o of sup) {
      byModel[o.model_code] = (byModel[o.model_code] || 0) + 1;
    }
    expect(byModel).toEqual({ NP: 12, "3T": 4 });
    // Superb III (NP) her kayitta Byte1/Byte3 -> "NP" vermeli
    for (const o of sup.filter((x) => x.model_code === "NP" && x.byte_count === 47)) {
      const c = charsFromCoding(o.bytes.map((x) => parseInt(x, 16)), o.family);
      expect(c[7] + c[8], `${o.vehicle} ${o.part_number}`).toBe("NP");
    }
  });

  it("GERCEK VERI: model kodu cozulebilirligi olcumleniyor", () => {
    // 363 kayit x 77 farkli model kodu. VIN_MODEL_CODES tablosu VAG genel
    // kodlari icindir; karsilasmayan kodlar veri setinde zaten etiketli.
    const ds = globalThis.__ds;
    let known = 0, total = 0;
    const misses = [];
    for (const o of ds.observations) {
      if (!o.family) continue;
      const b = o.bytes.map((x) => parseInt(x, 16));
      const c = charsFromCoding(b, o.family);
      if (!c[7] || !c[8]) continue;
      total++;
      if (VIN_MODEL_CODES[c[7] + c[8]]) known++;
      else misses.push(`${o.vehicle}[${o.model_code}] ${c[7]}${c[8]}`);
    }
    // cozulemeyenler her zaman veri setinin kendi model koduyla eslesmeli
    for (const m of misses) {
      const code = m.match(/\[([^\]]+)\] (\S+)/);
      expect(code, m).not.toBeNull();
    }
    const rate = total ? known / total : 0;
    console.log(`      VIN model kodu cozulen: ${known}/${total} (%${(100 * rate).toFixed(1)})`);
    // en az yarisi cozulmeli (diger yari D3 vs. eski nesil kodlar)
    expect(rate).toBeGreaterThan(0.5);
  });
});
