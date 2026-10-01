/**
 * Uretici: arac/donanim bilgisi -> uzun kodlama.
 *
 * Ayna kurali (bitrev) butun ailelerde aynidir; degisen sey ayna
 * haritasidir. Harita, VIN bayt konumlari ve veri bayt rolleri veri
 * setinden okunur. Yeni aile eklemek icin veri setine girmek yeterlidir.
 */

import { bitrev } from "./bits.js";
import { formatCode, filterObservations, MIN_SAMPLES, MIN_SHARE } from "./dataset.js";
import { getProfile } from "./profiles.js";

/**
 * @param {Dataset} ds
 * @param {object} spec
 *   family      : aile kimligi (zorunlu)
 *   length      : hedef bayt sayisi
 *   selections  : { 0:"1E", 2:"6A", ... }
 *   vin         : 17 haneli VIN
 *   equipment   : { 24:{1:true} } bit acik/kapali
 *   donor       : bilinmeyen baytlar icin temel kod
 *   tail        : kuyruk blogu
 */
export function encode(ds, spec) {
  const familyId = spec.family;
  if (!familyId) return { ok: false, errors: [{ code: "aileSecilmedi" }] };
  if (!ds.family(familyId)) return { ok: false, errors: [`bilinmeyen aile: ${familyId}`] };

  const prof = getProfile(familyId);
  if (!prof.supported)
    return {
      ok: false, errors: [{ code: "generateUnsupported" }], family: familyId,
      code: "", codeSpaced: "", bytes: [], applied: [], gaps: [],
      engine: prof.engine,
    };

  const errors = [];

  const tpl = ds.template(familyId);
  const mirrorMap = ds.mirrorMap(familyId);
  const srcMap = ds.mirrorSourceMap(familyId);
  const targetLen = spec.length ?? tpl?.default_length ?? 47;

  const bytes = new Array(targetLen).fill(null);
  const applied = [];
  const unresolved = [];
  // uretim guvenligi: her baytin nereden gelip ne kadar guvenilir oldugu
  const safeBytes = [];
  const uncertainBytes = [];

  // --- 1) veri baytlari (secimlerden)
  for (const [k, v] of Object.entries(spec.selections || {})) {
    const i = Number(k);
    if (v === null || v === undefined || v === "") continue;
    if (srcMap[i] !== undefined) continue; // ayna bayti, otomatik hesaplanir
    const hex = String(v).toUpperCase();
    if (!/^[0-9A-F]{1,2}$/.test(hex)) {
      errors.push({ code: "badValue", byte: i, value: v });
      continue;
    }
    bytes[i] = parseInt(hex, 16);
    const e = lookupMeaning(ds, familyId, i, hex);
    applied.push({ byte: i, value: hex, meaning: e.meaning, status: e.status });
  }

  // --- 2) bilinmeyen baytlari coz
  // Oncelik sirasi:  donor kod > en sik deger ( gozlemlerden ) > sabit deger
  // Donor vermek ZORUNLU DEGILDIR. Verilmezse gozlem istatistigi kullanilir
  // ve hangi baytlarin tahmin edildigi acikca raporlanir.
  const vinIdx = new Set(
    (tpl?.byte_template || [])
      .filter((t) => t.kind === "vin")
      .map((t) => t.index)
  );

  if (spec.donor) {
    const d = String(spec.donor).replace(/[^0-9a-fA-F]/g, "");
    for (let i = 0; i < targetLen && i * 2 < d.length; i++) {
      if (bytes[i] === null && !vinIdx.has(i)) {
        bytes[i] = parseInt(d.slice(i * 2, i * 2 + 2), 16);
        unresolved.push({ byte: i, from: "donor" });
      }
    }
  }

  // Gozlem istatistigi: her bayt icin en sik deger + kac gecerli gozlem.
  // HW/SW verildiyse istatistik yalnizca o surumden hesaplanir; aile geneli
  // "en sik deger" farkli donanimdan gelir ve araca uymaz.
  const scope = {
    hw: spec.hw || null,
    sw: spec.sw || null,
    partSeries: spec.partSeries || spec.part_series || null,
  };
  const hasScope = !!(scope.hw || scope.sw || scope.partSeries);
  const stats = ds.byteStats(familyId, targetLen, scope);
  const scopedObs = hasScope
    ? filterObservations(ds.observationsFor(familyId), scope)
    : ds.observationsFor(familyId);

  for (let i = 0; i < targetLen; i++) {
    if (bytes[i] !== null || vinIdx.has(i)) continue;
    const s = stats[i];
    if (!s) continue;                       // hic gozlem yok -> son adimda
    if (s.count >= s.total) {               // her aracta ayni -> sabit
      bytes[i] = parseInt(s.top, 16);
      applied.push({
        byte: i, value: s.top, status: "constant",
        meaning: null,
      });
      unresolved.push({ byte: i, from: "constant", value: s.top });
      safeBytes.push({ byte: i, value: s.top, reason: "constant", observed: s.total });
    } else {
      bytes[i] = parseInt(s.top, 16);
      const share = Math.round(100 * s.count / s.total);
      unresolved.push({ byte: i, from: "most_common", value: s.top, share,
                        observed: s.count, of: s.total });
      // Guven degerlendirmesi: yeterli gozlem + yeterli pay mi?
      const reliable = s.reliable;
      safeBytes.push({
        byte: i, value: s.top, share,
        observed: s.count, of: s.total, conflicts: s.conflicts,
        reliable,
        reason: reliable ? "data" : "unverified",
      });
      if (!reliable) uncertainBytes.push({ byte: i, value: s.top, share, observed: s.count, of: s.total });
    }
  }

  // --- 3) VIN baytlari (verilmisse yazar, yoksa donor koddan alir)
  const vinOut = applyVin(ds, familyId, bytes, spec.vin, errors, spec.donor, stats);

  // --- 3) ayna baytlari
  for (const [src, dst] of Object.entries(mirrorMap)) {
    const s = Number(src);
    const t = Number(dst);
    if (bytes[s] === null || bytes[s] === undefined) continue;
    bytes[t] = bitrev(bytes[s]);
    applied.push({ byte: t, value: formatCode([bytes[t]]), meaning: `ayna: Byte${s}`, status: "derived" });
  }

  // --- 4) donanim baytlari
  for (const [k, bits] of Object.entries(spec.equipment || {})) {
    const i = Number(k);
    if (bytes[i] === null || bytes[i] === undefined) bytes[i] = 0;
    for (const [b, on] of Object.entries(bits)) {
      const bit = Number(b);
      if (on) bytes[i] |= 1 << bit;
      else bytes[i] &= ~(1 << bit) & 0xff;
    }
    applied.push({ byte: i, value: formatCode([bytes[i]]), meaning: "donanim bitleri", status: "derived" });
  }

  // --- 5) kuyruk
  const tail = resolveTail(ds, familyId, spec, targetLen);
  if (tail) {
    for (let i = 0; i < tail.length && startIdx(tpl, i) < targetLen; i++) {
      const idx = startIdx(tpl, i);
      if (bytes[idx] === null) bytes[idx] = tail[i];
    }
  }

  // --- 6) bosluklari doldur
  const gaps = [];
  for (let i = 0; i < targetLen; i++) {
    if (bytes[i] === null) {
      // Son care: gozlemde de yoksa 0 yaz. Bu bayt icin elimizde
      // HICBIR gercek veri yoktur; kullaniciya acikca bildirilir.
      const s = stats[i];
      bytes[i] = s ? parseInt(s.top, 16) : 0;
      gaps.push(i);
      if (s)
        unresolved.push({ byte: i, from: "most_common", value: s.top });
      else
        unresolved.push({ byte: i, from: "unknown", value: "00" });
    }
  }

  // --- dogrulama
  const final = bytes.slice(0, targetLen);
  const mirrorChecks = [];
  for (const [src, dst] of Object.entries(mirrorMap)) {
    const s = Number(src);
    const t = Number(dst);
    if (s >= final.length || t >= final.length) continue;
    const exp = bitrev(final[s]);
    mirrorChecks.push({ src: s, dst: t, ok: exp === final[t], expected: formatCode([exp]) });
  }
  const badMirrors = mirrorChecks.filter((c) => !c.ok);
  if (badMirrors.length)
    errors.push({
      code: "mirrorMismatch",
      bytes: badMirrors.map((b) => b.dst),
    });

  // Hic cozulemeyen baytlar (gozlem de yok): bu bir UYARIdir, kod uretilir.
  const guessed = unresolved.filter((u) => u.from === "most_common");
  const constants = unresolved.filter((u) => u.from === "constant");
  const warnings = [];
  if (guessed.length)
    warnings.push({
      code: "manyGuessed",
      n: guessed.length,
      bytes: guessed.map((g) => ({ byte: g.byte, value: g.value, share: g.share })),
    });
  if (gaps.length)
    warnings.push({ code: "unresolvedBytes", n: gaps.length, bytes: gaps });

  // --- uretim guvenligi
  // Kod yazilabilir olmasi icin her baytin ya secilmis, ya da veriden
  // guvenilir sekilde turetilmis olmasi gerekir. "En sik deger" tek basina
  // yeterli kanit degilse kod uretilir ama YAZILABILIR sayilmaz.
  const scopeMatched = scopedObs.length;
  const scopeTotal = ds.observationsFor(familyId).length;
  const lowSample = hasScope && scopeMatched < MIN_SAMPLES;
  if (hasScope && !scopeMatched)
    warnings.push({
      code: "noScopedObservations",
      hw: scope.hw, sw: scope.sw,
    });
  else if (lowSample)
    warnings.push({
      code: "thinScopedSample",
      n: scopeMatched, hw: scope.hw, sw: scope.sw,
    });
  if (uncertainBytes.length)
    warnings.push({
      code: "unverifiedBytes",
      n: uncertainBytes.length,
      bytes: uncertainBytes,
    });

  // Ayna baytlari kaynaktan turer; kaynak guvenilir degilse ayna bayti da
  // guvenilmez sayilir (kod yine uretilir ama isaretlenir).
  const unverifiedSet = new Set(uncertainBytes.map((u) => u.byte));
  for (const [s, d] of Object.entries(mirrorMap)) {
    const si = Number(s);
    if (!unverifiedSet.has(si)) continue;
    const di = Number(d);
    if (unverifiedSet.has(di)) continue;
    unverifiedSet.add(di);
    uncertainBytes.push({ byte: di, value: final[di], mirrorOf: si });
  }

  const blocking = [];
  if (uncertainBytes.length) blocking.push("unverifiedBytes");
  if (gaps.length) blocking.push("unresolvedBytes");
  if (hasScope && !scopeMatched) blocking.push("noScopedObservations");
  if (hasScope && lowSample) blocking.push("thinScopedSample");
  const writable = blocking.length === 0;

  return {
    ok: errors.length === 0,
    // uretilen kod teknik olarak gecerli; yazilabilir mi ayrica belirtilir
    writable,
    blocking,
    safety: {
      scope: hasScope ? scope : null,
      scopeMatched,
      scopeTotal,
      filtered: hasScope && scopeMatched !== scopeTotal,
      lowSample,
      minSamples: MIN_SAMPLES,
      minShare: MIN_SHARE,
      safe: safeBytes,
      uncertain: uncertainBytes,
      confirmed: applied.length,
    },
    engine: prof.engine,
    errors,
    family: familyId,
    byteCount: final.length,
    code: formatCode(final),
    codeSpaced: formatCode(final, { spaced: true }),
    bytes: final,
    applied,
    unresolved,
    gaps,
    warnings,
    guessedCount: guessed.length,
    constantCount: constants.length,
    vin: vinOut,
    mirror: {
      total: mirrorChecks.length,
      ok: mirrorChecks.filter((c) => c.ok).length,
      checks: mirrorChecks,
    },
    tailUsed: tail ? formatCode(tail, { spaced: true }) : null,
    provenance: {
      hw: spec.hw || null,
      sw: spec.sw || null,
      donorUsed: !!spec.donor,
      donorBytes: unresolved.length,
    },
  };
}

function startIdx(tpl, i) {
  // Kuyruk blogunun baslangici aile sablonundan; yoksa MQB varsayilani.
  if (tpl?.byte_template?.length) {
    const tailStart = tpl.byte_template.find((x) => x.kind === "tail");
    if (tailStart) return tailStart.index;
  }
  return 30 + i;
}

function lookupMeaning(ds, familyId, i, hex) {
  const t = ds.valueTable(familyId, i).get(hex);
  if (t) return { meaning: t.meaning, status: t.status };
  const a = ds.addedValue(familyId, i, hex);
  if (a) return { meaning: a.meaning_inferred, status: "observed" };
  return { meaning: null, status: "no_description" };
}

/**
 * VIN baytlarini isler. Cozumleme sirasi:
 *   1) Kullanici VIN girdiyse -> o karakter
 *   2) Degilse ve bu bayt TUM araclarda ayniysa -> gozlem sabiti (VIN gerekmez)
 *   3) Degilse ve donor kod varsa -> donor koddan
 *   4) Degilse -> hata (bayt gercekten aractan araca degisiyor)
 */
function applyVin(ds, familyId, bytes, vin, errors, donor, stats) {
  const out = { used: [], fromDonor: [], constant: [], errors: [], required: [], estimated: [] };
  const tpl = ds.template(familyId);
  if (!tpl) return out;
  const vinChars = readVinChars(vin);
  const dhex = donor ? String(donor).replace(/[^0-9a-fA-F]/g, "") : "";

  for (const t of tpl.byte_template) {
    if (t.kind !== "vin") continue;
    const d = t.vin_digit;
    const ch = vinChars[d];

    // --- 1) VIN karakteri verildiyse
    if (ch !== undefined && ch !== null && ch !== "") {
      const val = String(ch).toUpperCase();
      let written = false;

      // (a) ofsetli sayisal alan: gozlemlerden turetilmis ofset.
      //     Bu baytlar yalnizca rakam kodlar (0x20..0x29 gibi).
      if (t.offset_kind === "add" && t.offset && /^\d$/.test(val)) {
        const off = parseInt(String(t.offset).replace("0x", ""), 16);
        const code = (parseInt(val, 10) + off) & 0xff;
        bytes[t.index] = code;
        out.used.push({ byte: t.index, vin_digit: d, char: val, value: formatCode([code]) });
        written = true;
      } else if (!t.offset_kind && !(t.offset_kind === "add" && t.offset)) {
        // (b) tablo tabanli alan (model kodu vb.): ters arama
        const table = ds.valueTable(familyId, t.index);
        for (const [k, v] of table) {
          if (String(v.meaning || "").trim() === val) {
            bytes[t.index] = parseInt(k, 16);
            out.used.push({ byte: t.index, vin_digit: d, char: val, value: k });
            written = true;
            break;
          }
        }
      }

      if (written) continue;

      // (c) cozulemedi: en sik degeri kullan, acikca uyar
      const st = stats?.[t.index];
      const numericOnly = Boolean(t.offset_kind === "add" && t.offset);
      const share = st ? Math.round((100 * st.count) / st.total) : null;
      out.required.push(t.index);
      out.errors.push({
        code: numericOnly ? "vinCharNotDigit" : "vinCharNotInTable",
        byte: t.index,
        digit: d,
        char: val,
        share,
      });
      if (st) {
        bytes[t.index] = parseInt(st.top, 16);
        out.estimated.push({ byte: t.index, value: st.top });
      }
      continue;
    }

    // --- 2) VIN verilmedi: bu bayt gercekten sabit mi?
    // realConstant: "00" (kodlanmamis) disarida birakilir; boylece
    // kullanilmayan baytlar "VIN gerekmez" sayilmaz.
    const s = stats?.[t.index];
    if (s && s.realConstant && s.realTop) {
      bytes[t.index] = parseInt(s.realTop, 16);
      out.constant.push({ byte: t.index, value: s.realTop, total: s.realTotal });
      continue;
    }

    // --- 3) donor koddan al
    if (dhex.length >= t.index * 2 + 2) {
      bytes[t.index] = parseInt(dhex.slice(t.index * 2, t.index * 2 + 2), 16);
      out.fromDonor.push(t.index);
      continue;
    }

    // --- 4) gercekten degisiyor: en sik degerle tahmin et, uyar
    // Kod 0 yazmak cok kotu bir sonuc verir (ayna tutarsiz olur ve
    // yanlis kod araca yazilir). En sik deger daha guvenli bir tahmindir
    // ve kullaniciya acikca bildirilir.
    out.required.push(t.index);
    if (s) {
      bytes[t.index] = parseInt(s.top, 16);
      out.estimated.push({
        byte: t.index, value: s.top,
        share: Math.round((100 * s.count) / s.total),
      });
      out.errors.push({
        code: "vinCharMissing",
        byte: t.index,
        digit: d,
        share: Math.round((100 * s.count) / s.total),
      });
    } else {
      out.errors.push({ code: "vinCharMissing", byte: t.index, digit: d, share: null });
    }
  }
  errors.push(...out.errors);
  return out;
}

/** VIN metnini karakter haritasina cevirir. */
export function readVinChars(vin) {
  if (!vin) return {};
  if (typeof vin === "object") return vin;
  const s = String(vin).trim().toUpperCase();
  if (s.length < 17) return {};
  const out = {};
  for (let i = 0; i < 17; i++) out[i + 1] = s[i];
  return out;
}

/** Kuyruk blogunu secer. */
function resolveTail(ds, familyId, spec, targetLen) {
  if (spec.tail) {
    const h = String(spec.tail).replace(/[^0-9a-fA-F]/g, "");
    const out = [];
    for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16));
    return out;
  }
  const opts = ds.tailOptions(familyId);
  if (opts.length) {
    const h = opts[0].tail.replace(/[^0-9a-fA-F]/g, "");
    const out = [];
    for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16));
    return out;
  }
  return null;
}
