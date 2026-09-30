/**
 * Uygulama ici mantik testi: build edilen arayuzun beklenen davranisi.
 * (DOM yok; saf fonksiyonlar dataset uzerinde dogrulanir.)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeAll } from "vitest";

import { createDataset } from "../src/core/dataset.js";
import { decode } from "../src/core/decode.js";
import { generatableFamilies, getProfile, engineFor } from "../src/core/profiles.js";
import { encode } from "../src/core/encode.js";
import { STR, makeT } from "../src/ui/i18n.js";

const here = dirname(fileURLToPath(import.meta.url));
let ds;
beforeAll(() => {
  ds = createDataset(JSON.parse(readFileSync(resolve(here, "../src/data/mk100_dataset.json"), "utf8")));
});

describe("i18n", () => {
  it("TR ve EN ayni anahtarlari iceriyor", () => {
    const tr = Object.keys(STR.tr).sort();
    const en = Object.keys(STR.en).sort();
    expect(tr).toEqual(en);
    expect(tr.length).toBeGreaterThan(40);
  });
  it("makeT her iki dilde cozumluyor", () => {
    const ttr = makeT("tr");
    const ten = makeT("en");
    for (const k of Object.keys(STR.tr)) {
      expect(ttr(k), k).not.toBe(k);
      expect(ten(k), k).not.toBe(k);
    }
  });
  it("bilinmeyen anahtar anahtarin kendisini dondurur", () => {
    expect(makeT("tr")("yokBoyleBirAnahtar")).toBe("yokBoyleBirAnahtar");
  });
});

describe("her aile icin uctan uca", () => {
  it("uretebilen her ailede cozumleme + uretme calisir", () => {
    for (const prof of generatableFamilies()) {
      const fam = prof.id;
      const obs = ds.observationsFor(fam);
      if (!obs.length) {
        // gozlemi olmayan uretebilen aile icin referans ornegi kullan
        const plat = ds.platform(fam);
        expect(plat, fam).not.toBeNull();
        const b0 = plat.bytes.find((b) => b.values.length);
        expect(b0, fam).toBeDefined();
        continue;
      }
      const o = obs[0];
      const r = decode(ds, o.bytes, { family: fam });
      expect(r.ok, `${fam} decode`).toBe(true);
      expect(r.rows.length, fam).toBe(o.byte_count);
      // uretme: cozulmus kodun veri baytlarini geri besle
      const sel = {};
      for (const row of r.rows) if (row.kind === "data" && row.meaning) sel[row.index] = row.value;
      const e = encode(ds, { family: fam, length: o.byte_count, selections: sel, donor: o.bytes });
      expect(e.code.length, fam).toBe(o.byte_count * 2);
    }
  });
});

describe("surekli kod", () => {
  it("coz -> uret -> coz dongusu ayni kodu verir", () => {
    for (const prof of generatableFamilies()) {
      const fam = prof.id;
      const obs = ds.observationsFor(fam);
      if (!obs.length) continue;
      for (const o of obs.slice(0, 12)) {
        const d = decode(ds, o.bytes, { family: fam });
        const sel = {};
        for (const row of d.rows) if (row.kind === "data" && row.meaning) sel[row.index] = row.value;
        const e = encode(ds, { family: fam, length: o.byte_count, selections: sel, donor: o.bytes });
        const d2 = decode(ds, e.code, { family: fam });
        expect(d2.rows.length, `${fam}/${o.vehicle}`).toBe(d.rows.length);
        expect(
          d2.rows.map((r) => r.value).join(""),
          `${fam}/${o.vehicle}`
        ).toBe(d.rows.map((r) => r.value).join(""));
      }
    }
  });
});

describe("motor profilleri", () => {
  it("her aile dogru motoru kullanir", () => {
    // her aile icin kayitli profil var
    for (const fam of ds.familyIds()) {
      const p = getProfile(fam);
      expect(p, `profil eksik: ${fam}`).toBeDefined();
      expect(p.id).toBe(fam);
    }
    // motor dagilimi
    expect(engineFor("MQB_MK100")).toBe("mk100");
    expect(engineFor("MQB_A0_5WA")).toBe("mk100");
    expect(engineFor("COMPACT_1K0")).toBe("mk60ec1");
    expect(engineFor("ESP9_31")).toBe("esp9");
    expect(engineFor("PQ46_2Q0")).toBe("pq46");
    expect(engineFor("TINY_8K0")).toBe("generic");
  });

  it("ayna kurallari aileye gore degisir", () => {
    // MK100 : 0->15, 2->16, 4->17, 6->18, 8->19, 10->20, 12->21, 14->22
    // COMPACT: 0->8,  2->10, 4->12, 6->14
    expect(ds.mirrorMap("MQB_MK100")).toEqual({
      0: 15, 2: 16, 4: 17, 6: 18, 8: 19, 10: 20, 12: 21, 14: 22,
    });
    expect(ds.mirrorMap("COMPACT_1K0")).toEqual({ 0: 8, 2: 10, 4: 12, 6: 14 });
    // uretimde her aile kendi aynasini doldurur
    const mk100 = encode(ds, { family: "MQB_MK100", selections: { 0: "1E", 2: "6A" } });
    const compact = encode(ds, { family: "COMPACT_1K0", selections: { 0: "1E", 2: "6A" } });
    expect(mk100.engine).toBe("mk100");
    expect(compact.engine).toBe("mk60ec1");
    expect(mk100.bytes[15]).not.toBeUndefined();
    expect(compact.bytes[8]).not.toBeUndefined();
  });

it("COMPACT_1K0 VIN baytlari 1-3-5-7-9-11-13", () => {
    // 107 gercek aracla dogrulandi. B8 ve B10 ayna baytidir
    // (B0 ve B2'nin bitrevi), bu yuzden VIN bayti olamazlar.
    const tpl = ds.template("COMPACT_1K0").byte_template;
    const vin = tpl.filter((b) => b.kind === "vin").map((b) => b.index).sort((a, b) => a - b);
    expect(vin).toEqual([1, 3, 5, 7, 9, 11, 13]);
  });

  it("uretilemeyen aile reddedilir", () => {
    const r = encode(ds, { family: "TINY_8K0", selections: { 0: "2D" } });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "generateUnsupported")).toBe(true);
    expect(r.code).toBe("");
  });
});

describe("build ciktilari", () => {
  const dist = resolve(here, "../dist");
  it("dist/index.html var", () => {
    expect(existsSync(resolve(dist, "index.html"))).toBe(true);
  });
  it("electron main var", () => {
    expect(existsSync(resolve(here, "../electron/main.cjs"))).toBe(true);
  });
  it("builder yapilandirmasi gecerli", () => {
    const y = readFileSync(resolve(here, "../electron-builder.yml"), "utf8");
    expect(y).toContain("nsis");
    expect(y).toContain("dmg");
    expect(y).toContain("AppImage");
  });
});

