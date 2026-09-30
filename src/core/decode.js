/**
 * Cozumleyici: uzun kodlama -> bayt bayt anlam.
 *
 * Her bayt icin: deger, anlam, kanit seviyesi (status), bit kirilimi,
 * ayna tutarliligi ve uyarilar.
 */

import { bitrev, toBin, testBits } from "./bits.js";
import { parseCode, formatCode } from "./dataset.js";

/** Kanit seviyesi onceligi: dusuk = daha guvenilir. */
const SEVERITY = {
  tested: 0,
  observed: 1,
  unconfirmed: 2,
  untested: 3,
  unclassified: 4,
  unknown: 5,
  no_description: 6,
  absent: 7,
};

function better(a, b) {
  if (!a) return b;
  if (!b) return a;
  return (SEVERITY[a] ?? 9) <= (SEVERITY[b] ?? 9) ? a : b;
}

/**
 * Bir bayti cozumler.
 * @returns {{index, value, bin, meaning, status, color, kind, role, bits, notes}}
 */
function decodeByte(ds, familyId, index, value, opts) {
  const { useObservations = true, observations = [] } = opts;
  const tpl = ds.template(familyId);
  const t = tpl?.byte_template?.find((x) => x.index === index) || {};
  const kind = t.kind || (index <= 14 ? "data" : index <= 22 ? "mirror" : "tail");
  const role = t.role || "unknown";

  const out = {
    index,
    value: formatCode([value]),
    bin: toBin(value),
    decimal: value,
    kind,
    role,
    vinDigit: t.vin_digit ?? null,
    roleLabel: ds.roleLabel(role, opts.lang || "tr") +
      (kind === "vin" && t.vin_digit ? ` (${t.vin_digit})` : ""),
    meaning: null,
    status: "no_description",
    color: null,
    cell: null,
    bits: [],
    notes: [],
    mirrorOf: null,
    mirrorOk: null,
    mirrorExpected: null,
  };

  // 1) referans deger tablosu
  const table = ds.valueTable(familyId, index);
  const hit = table.get(out.value);
  if (hit) {
    out.meaning = hit.meaning;
    out.status = hit.status || "no_description";
    out.color = hit.color || null;
    out.cell = hit.cell || null;
    if (hit.status === "no_description" || !hit.meaning) {
      out.notes.push("kaynakta bu degerin aciklamasi bos");
    }
  }

  // 2) referansta yoksa gercek arac gozlemi
  if (out.status === "no_description" || !out.meaning) {
    const added = ds.addedValue(familyId, index, out.value);
    if (added) {
      out.meaning = added.meaning_inferred;
      out.status = "observed";
      out.observedIn = added.vehicles || [];
      out.observedCount = added.count;
      out.source = added.source;
    }
  }

  // 3) ayni degeri tasiyan gercek araclar (taboda yoksa da)
  if (useObservations && (!out.meaning || out.status === "no_description")) {
    // once hizli indeks (veri seti onceden hesaplamis olur)
    const fast = ds.observedValue?.(familyId, index, out.value);
    if (fast) {
      out.observedIn = fast.vehicles;
      out.observedCount = fast.count;
    } else {
      const seen = new Map();
      for (const o of observations) {
        // bytes dizi (hex string) ya da bosluklu metin olabilir
        const arr = Array.isArray(o.bytes)
          ? o.bytes
          : typeof o.bytes === "string" ? o.bytes.trim().split(/\s+/) : [];
        if (index >= arr.length) continue;
        const v = String(arr[index]).toUpperCase();
        if (v === out.value) {
          const k = `${o.vehicle} ${o.year || ""}`.trim();
          seen.set(k, (seen.get(k) || 0) + 1);
        }
      }
      if (seen.size) {
        out.observedIn = [...seen.keys()].slice(0, 10);
        out.observedCount = [...seen.values()].reduce((a, b) => a + b, 0);
      }
    }
    if (out.observedIn?.length && !out.meaning)
      out.meaning = `${out.observedIn.length} araçta görüldü`;
    if (out.observedIn?.length && out.status === "no_description")
      out.status = "observed";
  }

  // 4) bit kirilimi
  out.bits = Array.from({ length: 8 }, (_, i) => ({
    bit: 7 - i,
    set: (value >> (7 - i)) & 1,
  }));

  // 5) ayna kontrolu
  const srcMap = ds.mirrorSourceMap(familyId);
  if (srcMap[index] !== undefined) {
    out.mirrorOf = srcMap[index];
  }

  return out;
}

/** Tum kodu cozer. */
export function decode(ds, codeText, options = {}) {
  const familyId = options.family;
  if (!familyId) {
    return { ok: false, error: "aile (platform) secilmedi", warnings: [], rows: [], bytes: [] };
  }
  const parsed = typeof codeText === "string" ? parseCode(codeText) : { ok: true, bytes: codeText };
  if (!parsed.ok) return { ...parsed, warnings: [], rows: [], bytes: [] };

  // Baytlar sayiya normalize edilir: veri seti "1E" gibi hex string saklar,
  // ayna kontrolu bitrev() ile sayi bekler. Aksi halde ayna hep "bozuk" cikar.
  const bytes = (parsed.bytes || []).map((b) =>
    typeof b === "number" ? b & 0xff : parseInt(String(b).trim().replace(/^0x/i, ""), 16)
  );
  const observations = options.observations ?? ds.observationsFor(familyId);
  const mirrorMap = ds.mirrorMap(familyId);
  const tpl = ds.template(familyId);
  const expectedLen = options.length ?? tpl?.default_length;

  const rows = bytes.map((v, i) =>
    decodeByte(ds, familyId, i, v, { useObservations: options.useObservations !== false, observations })
  );

  // ayna dogrulama
  let mirrorChecked = 0;
  let mirrorOk = 0;
  for (const row of rows) {
    if (row.mirrorOf === null) continue;
    const src = bytes[row.mirrorOf];
    if (src === undefined) continue;
    const exp = bitrev(src);
    row.mirrorExpected = formatCode([exp]);
    row.mirrorOk = exp === row.decimal;
    mirrorChecked++;
    if (row.mirrorOk) mirrorOk++;
  }

  // VIN baytlari
  const vinInfo = decodeVin(bytes, tpl);

  // uyarilar
  const warnings = [];
  for (const row of rows) {
    if (row.mirrorOk === false) {
      warnings.push({
        level: "error",
        byte: row.index,
        code: "mirror_mismatch",
        tr: `Byte${row.index} aynasi bozuk: kaynak Byte${row.mirrorOf}=${formatCode([bytes[row.mirrorOf]])} ` +
            `olmali ${row.mirrorExpected} idi, kodda ${row.value} var`,
        en: `Byte${row.index} mirror mismatch: source Byte${row.mirrorOf}=${formatCode([bytes[row.mirrorOf]])} ` +
            `should be ${row.mirrorExpected}, found ${row.value}`,
      });
    }
  }
  if (expectedLen && bytes.length !== expectedLen) {
    warnings.push({
      level: bytes.length < expectedLen ? "warn" : "info",
      code: "length_mismatch",
      tr: `Kod ${bytes.length} bayt, bu ailede tipik ${expectedLen} bayt`,
      en: `Code is ${bytes.length} bytes, typically ${expectedLen} for this family`,
    });
  }
  if (bytes.every((b) => b === 0)) {
    warnings.push({
      level: "error",
      code: "wiped",
      tr: "Kod tamamen sifir - modul kodlamasi silinmis. Donor kod + VIN ile yeniden uretilmeli.",
      en: "Code is all zero - module coding was wiped. Needs donor code + VIN.",
    });
  }
  const unknown = rows.filter((r) => r.status === "no_description" && r.kind === "data");
  if (unknown.length) {
    warnings.push({
      level: "info",
      code: "unknown_values",
      tr: `${unknown.length} veri bayti tabloda tanimsiz: ${unknown.map((u) => `B${u.index}=${u.value}`).join(", ")}`,
      en: `${unknown.length} data bytes not in table: ${unknown.map((u) => `B${u.index}=${u.value}`).join(", ")}`,
    });
  }

  return {
    ok: true,
    family: familyId,
    byteCount: bytes.length,
    bytes,
    expectedLength: expectedLen || null,
    rows,
    mirror: { checked: mirrorChecked, ok: mirrorOk, rate: mirrorChecked ? (100 * mirrorOk) / mirrorChecked : null },
    vin: vinInfo,
    warnings,
    code: formatCode(bytes),
    codeSpaced: formatCode(bytes, { spaced: true }),
  };
}

/** VIN baytlarini cozmeye calisir (geriye donusum). */
function decodeVin(bytes, tpl) {
  const out = { complete: false, chars: {}, errors: [] };
  if (!tpl) return out;
  for (const t of tpl.byte_template) {
    if (t.kind !== "vin" || t.vin_digit === undefined) continue;
    if (t.index >= bytes.length) continue;
    const raw = bytes[t.index];
    if (t.offset_kind === "add" && t.offset) {
      const off = parseInt(String(t.offset).replace("0x", ""), 16);
      const d = (raw - off) & 0xff;
      if (d <= 9) {
        out.chars[t.vin_digit] = String(d);
        continue;
      }
      out.errors.push({ byte: t.index, digit: t.vin_digit, value: formatCode([raw]) });
      continue;
    }
    // ofsetsiz: tabloya bak
    out.chars[t.vin_digit] = null;
  }
  const keys = Object.keys(out.chars);
  out.complete = keys.length > 0 && keys.every((k) => out.chars[k] != null);
  out.partial = keys.filter((k) => out.chars[k] != null).map((k) => out.chars[k]).join("");
  return out;
}
