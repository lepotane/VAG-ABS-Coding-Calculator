/**
 * mk100_dataset.json yukleyici + dogrulama.
 *
 * Veri seti programdan ayrilir: dosyayi degistirmek programi degistirmez.
 * Bu, veri kapsamini genisletmek icin tek yol.
 */

export const DATASET_VERSION = "2.0.0";

/** Minimum desteklenen sema surumu. */
export const MIN_SCHEMA = "1.0.0";

/**
 * Uretim guvenligi esikleri.
 *
 * Bir baytin "en sik degeri" ancak yeterli gozlemde ve yeterli payla
 * onaylandiginda guvenilirdir. Aksi halde deger sadece en sik olan -- bu
 * aracinin dogru degeri oldugu anlamina gelmez.
 */
export const MIN_SAMPLES = 3;   // bu kadar gozlemden az varsa karar verilmez
export const MIN_SHARE = 0.6;    // en sik deger bu payi tutmali

function hasAnyKey(f) {
  return !!(f && Object.values(f).some((v) => v != null && v !== ""));
}

/** Gozlemleri donanim/yazilim/part serisine gore daraltir. */
export function filterObservations(obs, filter = {}) {
  const { hw, sw, partSeries } = filter || {};
  if (!hasAnyKey({ hw, sw, partSeries })) return obs;
  return obs.filter((o) => {
    if (hw && o.hardware !== hw) return false;
    if (sw && o.software !== sw) return false;
    if (partSeries && o.part_series !== partSeries) return false;
    return true;
  });
}

function cmpVer(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

export class Dataset {
  constructor(raw) {
    this.raw = raw;
    this.meta = raw.meta || {};
    this.families = raw.families || {};
    this.rules = raw.rules || {};
    this.byteTemplates = raw.byte_templates || {};
    this.validation = raw.validation || {};
    this.platforms = raw.platforms || [];
    this.observations = raw.observations || [];
    this.observationsExcluded = raw.observations_excluded || [];

    this._platById = new Map();
    for (const p of this.platforms) this._platById.set(p.id, p);
    this._platByFamily = new Map();
    for (const p of this.platforms) {
      if (!p.family) continue;
      if (!this._platByFamily.has(p.family)) this._platByFamily.set(p.family, []);
      this._platByFamily.get(p.family).push(p);
    }
    this._added = this._indexAdded();
    this._obsByByte = this._indexObservations();
  }

  /**
   * Bayt istatistigi: her bayt icin en sik deger ve gecerli gozlem sayisi.
   * Uretimde bilinmeyen baytlari doldurmak icin kullanilir; boylece
   * kullaniciya donor kodu vermek zorunda kalmaz.
   *
   * @param {string} familyId
   * @param {number} length
   * @param {{hw?:string, sw?:string, partSeries?:string}} [filter]
   *   Donanim/yazilim filtresi. Ayni aile icinde 12 farkli donanim surumu
   *   olabilir ve "en sik deger" farkli araclardan gelir. HW/SW verildiginde
   *   istatistik yalnizca o surumdeki gozlemlerden hesaplanir.
   * @returns {Object<number,{top:string,topCount:number,count:number,total:number,distinct:number}>}
   */
  byteStats(familyId, length, filter = {}) {
    const all = this.observationsFor(familyId);
    const obs = filterObservations(all, filter);
    // Filtre verildi ama hic eslesme yoksa aile geneline duser. SESSIZCE
    // yanlis deger uretmektense bos kalmasi daha guvenlidir; uretici
    // `matched` sayisini kontrol eder.
    const scoped = obs.length ? obs : filter && hasAnyKey(filter) ? [] : all;
    if (!scoped.length) return {};
    const out = {};
    for (let i = 0; i < length; i++) {
      const freq = new Map();
      let total = 0;
      for (const o of scoped) {
        if (i >= o.bytes.length) continue;
        const v = String(o.bytes[i]).toUpperCase();
        freq.set(v, (freq.get(v) || 0) + 1);
        total++;
      }
      if (!total) continue;
      let top = null, topCount = 0;
      for (const [v, c] of freq) {
        if (c > topCount) { top = v; topCount = c; }
      }
      // Tam sifir kodlama ("00") kodlanmamis modul demektir; sabit deger
      // sayilmaz, yoksa kullanilmayan baytlar "VIN gerekmiyor" gibi
      // gorunur.
      const zeroCount = freq.get("00") || 0;
      const realFreq = new Map([...freq].filter(([v]) => v !== "00"));
      let realTop = null, realTopCount = 0, realTotal = 0;
      for (const [v, c] of realFreq) {
        realTotal += c;
        if (c > realTopCount) { realTop = v; realTopCount = c; }
      }
      const onlyZero = realTotal === 0;
      // Guven: en sik degerin gecerli gozlemler icindeki payi.
      // Dusuk pay = bu deger bu ailede "tipik" degil, sadece en sik olan.
      const share = realTotal ? realTopCount / realTotal : 0;
      out[i] = {
        top,
        topCount,
        count: topCount,
        total,
        distinct: freq.size,
        constant: freq.size === 1,
        // gercek (kodlanmis) gozlem istatistigi
        onlyZero,
        realTop,
        realTopCount,
        realTotal,
        realDistinct: realFreq.size,
        realConstant: !onlyZero && realFreq.size === 1,
        zeroCount,
        // kapsam ve guven
        matched: scoped.length,
        scopeTotal: all.length,
        filtered: !!(obs.length && obs.length !== all.length),
        share,
        // en sik deger tek basina bile cogunluk degilse guvenilmez sayilir
        reliable: realTotal >= MIN_SAMPLES && share >= MIN_SHARE,
        conflicts: realFreq.size,
      };
    }
    return out;
  }

  /**
   * Bir ailede bilinen donanim/yazilim surumleri.
   * Uretim arayuzunde HW/SW alanlarini doldurmak icin.
   */
  hardwareVersions(familyId) {
    const obs = this.observationsFor(familyId);
    const hw = new Map();
    for (const o of obs) {
      const h = o.hardware || null;
      if (!h) continue;
      if (!hw.has(h)) hw.set(h, { hw: h, count: 0, sw: new Map(), partSeries: new Set() });
      const e = hw.get(h);
      e.count++;
      if (o.software) e.sw.set(o.software, (e.sw.get(o.software) || 0) + 1);
      if (o.part_series) e.partSeries.add(o.part_series);
    }
    return [...hw.values()]
      .map((e) => ({
        hw: e.hw,
        count: e.count,
        partSeries: [...e.partSeries],
        sw: [...e.sw.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([sw, n]) => ({ sw, count: n })),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Bir bayt icin deger -> gozlem sayisi istatistigi.
   * Secim listelerinde "en sik N/M" ve "ayrica" bilgisi uretmek icin.
   * @returns {Map<string,{value,count,total,others:Array<{value,count,total}>}>}
   */
  byteValueStats(familyId, byteIndex) {
    const obs = this.observationsFor(familyId);
    const out = new Map();
    if (!obs.length) return out;
    const freq = new Map();
    let total = 0;
    for (const o of obs) {
      if (byteIndex >= o.bytes.length) continue;
      const v = String(o.bytes[byteIndex]).toUpperCase();
      if (v === "00") continue; // kodlanmamis modul sayilmaz
      freq.set(v, (freq.get(v) || 0) + 1);
      total++;
    }
    if (!total) return out;
    const rows = [...freq.entries()]
      .map(([value, count]) => ({ value, count, total }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    for (const r of rows) {
      out.set(r.value, { ...r, others: rows });
    }
    return out;
  }

  /**
   * Gozlem tabanli deger indeksi: veri setinde aciklamasi olmayan bir bayt
   * degerinin gercek araclarda kac kez ve hangi araclarda goruldugu.
   * Cozumleyici bunu "observed" olarak gosterir.
   */
  observedValue(familyId, byteIndex, value) {
    const fam = this.raw.observed_values?.[familyId];
    if (!fam) return null;
    const b = fam[String(byteIndex)];
    if (!b) return null;
    const hit = b[String(value).toUpperCase()];
    if (!hit) return null;
    return {
      value: String(value).toUpperCase(),
      count: hit.count,
      vehicles: hit.vehicles || [],
      status: "observed",
    };
  }

  /** validation icindeki "referansta yok ama araclarda goruldu" degerleri. */
  _indexAdded() {
    const map = new Map();
    const added =
      this.validation.values_found_in_vehicles_but_missing_from_reference || {};
    for (const [byteKey, values] of Object.entries(added)) {
      const idx = Number(String(byteKey).replace(/[^0-9]/g, ""));
      for (const [val, rec] of Object.entries(values)) {
        map.set(`${idx}:${val.toUpperCase()}`, { ...rec, value: val.toUpperCase() });
      }
    }
    return map;
  }

  /** gozlemlerden byte degeri -> arac listesi indeksi. */
  _indexObservations() {
    const byFam = new Map();
    for (const o of this.observations) {
      if (!o.family) continue;
      if (!byFam.has(o.family)) byFam.set(o.family, []);
      byFam.get(o.family).push(o);
    }
    return byFam;
  }

  /** Aile tanimini getirir. */
  family(id) {
    return this.families[id] || null;
  }

  familyIds() {
    return Object.keys(this.families);
  }

  /** Aile sablonu (bayt roleri). */
  template(familyId) {
    return this.byteTemplates[familyId] || null;
  }

  /** Aileye ait referans platform tablosu. */
  platform(familyId, prefer = "primary") {
    const list = this._platByFamily.get(familyId) || [];
    if (!list.length) return null;
    const tmpl = this.byteTemplates[familyId];
    if (tmpl && tmpl.sheet) {
      const hit = list.find((p) => p.id === tmpl.sheet);
      if (hit) return hit;
    }
    const active = list.filter((p) => p.sheet_status !== "draft");
    if (prefer === "any") return list[0];
    return active[0] || list[0];
  }

  /** Bir baytin deger tablosu: { "1E": {value, meaning, status, ...} } */
  valueTable(familyId, byteIndex) {
    const p = this.platform(familyId);
    if (!p) return new Map();
    const b = p.bytes.find((x) => x.index === byteIndex);
    if (!b) return new Map();
    const m = new Map();
    for (const v of b.values) m.set(v.value.toUpperCase(), v);
    return m;
  }

  /** Bit kurallari. */
  bitRules(familyId, byteIndex) {
    const p = this.platform(familyId);
    if (!p) return [];
    const b = p.bytes.find((x) => x.index === byteIndex);
    return b ? b.bit_rules || [] : [];
  }

  /** Ayna haritasi: { "0": 15, "2": 16, ... } */
  mirrorMap(familyId) {
    const f = this.families[familyId];
    if (!f || !f.mirror_map) return {};
    const out = {};
    for (const [k, v] of Object.entries(f.mirror_map)) out[Number(k)] = v;
    return out;
  }

  /** ters harita: ayna bayt -> kaynak bayt */
  mirrorSourceMap(familyId) {
    const out = {};
    for (const [src, dst] of Object.entries(this.mirrorMap(familyId))) out[dst] = Number(src);
    return out;
  }

  /** Referansta olmayip gercek araclarda gorulen deger. */
  addedValue(familyId, byteIndex, value) {
    const fam = this._added.get(`${byteIndex}:${String(value).toUpperCase()}`);
    return fam || null;
  }

  observationsFor(familyId) {
    return this._obsByByte.get(familyId) || [];
  }

  /** Aileye ait gercek arac ornekleri, uzunluga gore. */
  observationsByLength(familyId, length) {
    return this.observationsFor(familyId).filter((o) => o.byte_count === length);
  }

  /** En sik gozlenen kuyruk blogu. */
  tailOptions(familyId) {
    const t = this.rules.tail_block_mqb_47_48;
    if (!t || !t.variants) return [];
    return t.variants;
  }

  /** HW koduna gore olasi bayt sayilari. */
  lengthsForHw(familyId, hw) {
    const m = this.rules.byte_count_by_family_and_hw?.[familyId];
    if (!m) return [];
    const e = m[hw];
    if (!e) return [];
    return Object.entries(e)
      .map(([k, n]) => ({ length: Number(k), count: n }))
      .sort((a, b) => b.count - a.count);
  }

  /** Bayt rol etiketi (aktif dile gore). */
  roleLabel(role, lang = "tr") {
    const e = ROLE_LABELS[role];
    if (!e) return role || "unknown";
    return e[lang] || e.tr || role;
  }

  /** Semay uyumluluk kontrolu. */
  checkCompatibility() {
    const problems = [];
    const v = this.meta.schema_version;
    if (!v) problems.push("meta.schema_version yok");
    else if (cmpVer(v, MIN_SCHEMA) < 0)
      problems.push(`sem surumu cok eski: ${v} (min ${MIN_SCHEMA})`);
    if (!this.families || !Object.keys(this.families).length)
      problems.push("families bos");
    for (const [fid, t] of Object.entries(this.byteTemplates)) {
      if (!t || !Array.isArray(t.byte_template))
        problems.push(`${fid}: byte_template yok`);
    }
    return { ok: problems.length === 0, problems };
  }

  /** Ozet bilgi (UI basligi icin). */
  summary() {
    const st = this.raw.statistics || {};
    const famIds = Object.keys(this.families);
    // Ayna dogrulamasi toplamlari (v2: her aile kendi sayacini tasir)
    let mOk = 0, mTot = 0, familiesWithMirror = 0, perfectFamilies = 0;
    for (const fid of famIds) {
      const mv = this.families[fid]?.mirror_verified;
      if (!mv || !mv.checked) continue;
      familiesWithMirror++;
      mOk += mv.ok;
      mTot += mv.checked;
      if (mv.pct === 100) perfectFamilies++;
    }
    return {
      schema: this.meta.schema_version,
      dataset: this.meta.dataset_version,
      families: famIds.length,
      platforms: this.platforms.length,
      observations: this.observations.length,
      fetched: st.total_records_fetched ?? null,
      withCoding: st.records_with_coding ?? null,
      complete: st.records_complete ?? null,
      partial: st.records_partial ?? null,
      uniqueCodings: st.unique_codings ?? null,
      mirrorOk: mOk,
      mirrorTotal: mTot,
      mirrorRate: mTot ? Math.round((100 * mOk * 100) / mTot) / 100 : null,
      familiesWithMirror,
      perfectFamilies,
      additions: this.validation?.additions_total || 0,
      avgAccuracy: null,
    };
  }
}

export const ROLE_LABELS = {
  vehicle_variant: { tr: "Araç varyantı", en: "Vehicle variant" },
  brake_side: { tr: "Fren sistemi + direksiyon", en: "Brake system + side" },
  front_brake: { tr: "Ön fren", en: "Front brake" },
  rear_brake: { tr: "Arka fren", en: "Rear brake" },
  steering: { tr: "Direksiyon / HBV / ROP", en: "Steering / HBV / ROP" },
  epb_startup: { tr: "EPB / çalıştırma varyantı", en: "EPB / start-up variant" },
  drivetrain: { tr: "Çekiş (FWD/AWD)", en: "Drivetrain (FWD/AWD)" },
  eds_tire: { tr: "EDS / lastik", en: "EDS / tyre" },
  vin: { tr: "VIN karakteri", en: "VIN character" },  driver_assist: { tr: "Sürüş asistanı", en: "Driver assist" },
  acc_front_assist: { tr: "ACC / Front Assist", en: "ACC / Front Assist" },
  hill_hold_engine: { tr: "Yokuş kalkış / motor", en: "Hill hold / engine" },
  wheel_sensor: { tr: "Tekerlek hız sensörü", en: "Wheel speed sensor" },
  tpms: { tr: "TPMS", en: "TPMS" },
  bap_buttons: { tr: "BAP düğmeleri", en: "BAP buttons" },
  esc_config: { tr: "ESC yapılandırma", en: "ESC configuration" },
  tail_or_checksum: { tr: "Kuyruk / kontrol", en: "Tail / checksum" },
  unknown: { tr: "Bilinmiyor", en: "Unknown" },
};

export const STATUS_META = {
  tested: { tr: "Test edilmiş", en: "Tested", level: "ok" },
  unconfirmed: { tr: "%100 teyit değil", en: "Not 100% confirmed", level: "warn" },
  untested: { tr: "Test edilmemiş", en: "Untested", level: "warn2" },
  unknown: { tr: "Bilinmiyor", en: "Unknown", level: "bad" },
  unclassified: { tr: "Sınıflanmamış", en: "Unclassified", level: "bad" },
  no_description: { tr: "Açıklama yok", en: "No description", level: "bad" },
  observed: { tr: "Gerçek araçtan", en: "From real cars", level: "obs" },
  absent: { tr: "Boyasız", en: "Unfilled", level: "bad" },
};

/** JSON'dan Dataset olusturur. */
export function createDataset(raw) {
  return new Dataset(raw);
}

/**
 * Bir kodlama metnini bayt dizisine cevirir.
 * "1E 07 6A" / "1E076A" / "1e-07-6a" hepsi kabul edilir.
 */
export function parseCode(text) {
  if (typeof text !== "string") return { ok: false, error: "metin degil" };
  const clean = text.replace(/[^0-9a-fA-F]/g, "");
  if (!clean.length) return { ok: false, error: "hex karakter yok" };
  if (clean.length % 2 !== 0)
    return { ok: false, error: `cift karakter degil (${clean.length} haneli)` };
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2)
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return { ok: true, bytes, hex: clean.toUpperCase() };
}

/** Bayt dizisini bosluksuz/bolmeli hex metne cevirir. */
export function formatCode(bytes, { spaced = false, upper = true } = {}) {
  const parts = bytes.map((b) =>
    (b & 0xff).toString(16).padStart(2, "0")
  );
  const hex = spaced ? parts.join(" ") : parts.join("");
  return upper ? hex.toUpperCase() : hex;
}
