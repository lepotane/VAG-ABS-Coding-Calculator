/**
 * Veri seti dogrulama araci.
 *
 * Kontroller:
 *   - sema surumu
 *   - aile tanimlari (ayna haritasi, bayt sablonu, uzunluklar)
 *   - gozlem butunlugu (bayt sayisi, kod bicimi)
 *   - ayna kuralinin her ailede gecerliligi
 *   - VIN bayt konumlari
 *
 * Kullanim:  node scripts/validate-dataset.mjs [dosya]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDataset } from "../src/core/dataset.js";
import { decode } from "../src/core/decode.js";
import { getProfile } from "../src/core/profiles.js";

const here = dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2];
const file = arg
  ? resolve(process.cwd(), arg)
  : resolve(here, "../src/data/mk100_dataset.json");

if (!existsSync(file)) {
  console.error(`dosya bulunamadi: ${file}`);
  process.exit(1);
}

const ds = createDataset(JSON.parse(readFileSync(file, "utf8")));
let errors = 0, warnings = 0;
const err = (m) => { errors++; console.log(`  [HATA] ${m}`); };
const warn = (m) => { warnings++; console.log(`  [UYARI] ${m}`); };
const head = (n, t) => console.log(`\n${n}) ${t}`);

console.log(`dosya: ${file}`);
console.log(`sema : ${ds.meta.schema_version}`);

/* ------------------------------------------------------------------ 1 */
head(1, "Sema ve temel alanlar");
if (!ds.meta.schema_version) err("meta.schema_version yok");
if (!ds.families || !Object.keys(ds.families).length) err("families bos");
if (!ds.observations?.length) err("observations bos");
console.log(`  aile     : ${Object.keys(ds.families).length}`);
console.log(`  gozlem   : ${ds.observations.length}`);

/* ------------------------------------------------------------------ 2 */
head(2, "Aile tanimlari");
for (const fid of ds.familyIds()) {
  const f = ds.family(fid);
  const tpl = ds.template(fid);
  const L = f.default_length;

  if (!tpl) { err(`${fid}: byte_template yok`); continue; }
  if (tpl.byte_template.length !== L)
    err(`${fid}: byte_template ${tpl.byte_template.length} bayt, default_length ${L}`);

  const mm = ds.mirrorMap(fid);
  for (const [src, dst] of Object.entries(mm)) {
    if (+dst >= L) err(`${fid}: ayna hedefi byte${dst} bayt sayisini (${L}) asiyor`);
    if (+src >= L) err(`${fid}: ayna kaynagi byte${src} bayt sayisini (${L}) asiyor`);
  }

  const mir = ds.mirrorSourceMap(fid);
  for (const b of tpl.byte_template) {
    if (b.kind === "mirror" && mir[b.index] === undefined)
      warn(`${fid}: byte${b.index} mirror isaretli ama haritada yok`);
    if (b.kind === "vin" && b.vin_digit == null)
      err(`${fid}: byte${b.index} vin ama vin_digit tanimsiz`);
  }

  const prof = getProfile(fid);
  if (!prof || prof.id !== fid) err(`${fid}: profil tanimsiz`);
}

const noMirror = ds.familyIds().filter((f) => !Object.keys(ds.mirrorMap(f)).length);
console.log(`  aynasiz aile: ${noMirror.length ? noMirror.join(", ") : "(yok)"}`);

/* ------------------------------------------------------------------ 3 */
head(3, "Gozlem butunlugu");
const famIds = new Set(ds.familyIds());
for (const o of ds.observations) {
  if (!famIds.has(o.family)) { err(`gozlem bilinmeyen aile: ${o.family}`); continue; }
  if (!Array.isArray(o.bytes)) { err(`${o.vehicle}: bytes dizi degil`); continue; }
  if (o.bytes.length !== o.byte_count)
    err(`${o.vehicle}: byte_count ${o.byte_count} != bytes ${o.bytes.length}`);
  for (const b of o.bytes) {
    if (!/^[0-9A-F]{2}$/.test(b)) { err(`${o.vehicle}: gecersiz bayt "${b}"`); break; }
  }
  const tpl = ds.template(o.family);
  if (tpl && tpl.lengths && !tpl.lengths.includes(o.byte_count))
    warn(`${o.family}: ${o.byte_count} bayt aile uzunluklarinda yok`);
}
const zero = ds.observations.filter((o) => o.bytes.every((b) => b === "00"));
console.log(`  tam sifir kodlama: ${zero.length}`);

/* ------------------------------------------------------------------ 4 */
head(4, "Cozumleme testi (her gozlem)");
let decOk = 0;
for (const o of ds.observations) {
  const r = decode(ds, o.bytes, { family: o.family });
  if (!r.ok) { err(`${o.vehicle} cozulemedi`); continue; }
  if (r.rows.length !== o.byte_count) {
    err(`${o.vehicle}: ${r.rows.length} satir, beklenen ${o.byte_count}`);
    continue;
  }
  decOk++;
}
console.log(`  cozulen: ${decOk}/${ds.observations.length}`);

/* ------------------------------------------------------------------ 5 */
head(5, "Ayna kurali dogrulamasi");
let mOk = 0, mTot = 0;
for (const fid of ds.familyIds()) {
  const mv = ds.family(fid).mirror_verified;
  if (!mv || !mv.checked) {
    console.log(`  ${fid.padEnd(16)} ayna kurali yok`);
    continue;
  }
  mOk += mv.ok; mTot += mv.checked;
  const flag = mv.pct === 100 ? "TAM" : mv.pct >= 99 ? "IYI" : "ZAYIF";
  if (mv.pct < 90) err(`${fid}: ayna %${mv.pct} cok dusuk`);
  console.log(
    `  ${fid.padEnd(16)} ${mv.ok}/${mv.checked}  %${mv.pct}  ${flag}` +
    (mv.exceptions?.length ? `  (${mv.exceptions.length} istisna)` : "")
  );
}
console.log(`  toplam: ${mOk}/${mTot} = %${mTot ? ((100 * mOk) / mTot).toFixed(2) : 0}`);

/* ------------------------------------------------------------------ 6 */
head(6, "VIN bayt konumlari");
const EXPECT = [1, 3, 5, 7, 8, 9, 10, 11, 13];
for (const fid of ds.familyIds()) {
  const tpl = ds.template(fid);
  const vin = tpl.byte_template.filter((b) => b.kind === "vin").map((b) => b.index);
  const odd = vin.filter((i) => i % 2 === 1);
  const unusual = vin.filter((i) => i % 2 === 0);
  if (unusual.length) warn(`${fid}: cift konumlu VIN bayti: ${unusual.join(",")}`);
  const bad = vin.filter((i) => !EXPECT.includes(i));
  if (bad.length) err(`${fid}: bilinmeyen VIN bayti ${bad.join(",")}`);
}
console.log("  kontrol tamam");

/* ------------------------------------------------------------------ */
console.log("\n========================================================");
console.log(
  errors ? `SONUC: BASARISIZ - ${errors} hata, ${warnings} uyari`
         : warnings ? `SONUC: GECERLI - ${warnings} uyari`
                    : "SONUC: GECERLI"
);
process.exit(errors ? 1 : 0);