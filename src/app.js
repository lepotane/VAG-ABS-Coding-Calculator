import { createDataset, formatCode } from "./core/dataset.js";
import { decode } from "./core/decode.js";
import { encode } from "./core/encode.js";
import { decodeVin, VIN_MODEL_CODES, VIN_WMI, VIN_PLANT, decodeModelYear, charsFromCoding } from "./core/vin.js";
import { translateMeaning } from "./core/i18n-data.js";
import { makeT, familyLabel, mirrorNote, encodeMessages } from "./ui/i18n.js";
import { getProfile, PROFILE_NOTES } from "./core/profiles.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

let DS = null;
let lang = localStorage.getItem("mk100.lang") || "tr";
let t = makeT(lang);

/* ==================================================================== init */
async function init() {
  try {
    document.body.classList.toggle("web", !window.mk100);
    const loaded = await loadDataset();
    if (!loaded) return;
    const compat = DS.checkCompatibility();
    if (!compat.ok) {
      document.body.innerHTML =
        `<div style="padding:40px;font-family:monospace;color:#f85149">` +
        `Veri seti uyumsuz:<br>${compat.problems.map(esc).join("<br>")}</div>`;
      return;
    }
  applyStaticText();
  buildFamilySelect();
  buildEncodeForm();
  bind();
  if (window.mk100) initTitlebar();
  switchTab(localStorage.getItem("mk100.tab") || "decode");
  if ($("#code").value) runDecode();
  } catch (e) {
    console.error("INIT HATASI:", e);
    document.body.innerHTML =
      `<div style="padding:40px;font-family:monospace;color:#f85149">` +
      `BaÅŸlatma hatasÄ±:<br>${esc(String(e && e.stack || e))}</div>`;
  }
}

/** Veri setini yukler: Electron ise dosyadan, tarayici ise fetch. */
async function loadDataset() {
  const fail = (msg) => {
    document.body.innerHTML =
      `<div style="padding:40px;font-family:monospace;color:#f85149">` +
      `Veri seti yüklenemedi:<br>${esc(String(msg))}</div>`;
    return false;
  };
  try {
    if (window.mk100) {
      const r = await window.mk100.readDataset();
      if (r && r.error) return fail("Dosya okunamadÄ±: " + r.error);
      if (r && r.raw) {
        DS = createDataset(JSON.parse(r.raw));
        return true;
      }
      // dosya bulunamadi: gomulu veriye dus
    }
    const res = await fetch(new URL("./data/mk100_dataset.json", import.meta.url));
    if (!res.ok) return fail("HTTP " + res.status);
    DS = createDataset(await res.json());
    return true;
  } catch (e) {
    return fail(e && e.stack ? e.stack : e);
  }
}

function reloadDataset() {
  loadDataset().then((ok) => {
    if (!ok) return;
    applyStaticText();
    buildFamilySelect();
    buildEncodeForm();
    switchTab($(".tabs button.on")?.dataset.tab || "decode");
    if ($("#code").value) runDecode();
  });
}

/* ------------------------------------------------- pencere kontrolu */
function initTitlebar() {
  const min = $("#btnMin"), max = $("#btnMax"), close = $("#btnClose");
  if (!min) return;
  const setMaxIcon = (maximized) => {
    max.innerHTML = maximized
      ? '<svg viewBox="0 0 10 10"><path d="M2 0h8v8H8v2H0V2h2zm1 1v2h2v2h4V1z"/></svg>'
      : '<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0zm1 1v8h8V1z"/></svg>';
  };
  min.addEventListener("click", () => window.mk100.minimize());
  max.addEventListener("click", async () => setMaxIcon(await window.mk100.maximize()));
  close.addEventListener("click", () => window.mk100.close());
  window.mk100.isMaximized().then(setMaxIcon);
  window.mk100.onWindowState((s) => setMaxIcon(!!s.maximized));
  // cift tik maximizes
  $("#titlebar .drag").addEventListener("dblclick", async () =>
    setMaxIcon(await window.mk100.maximize()));
  window.mk100.onReload(reloadDataset);
}

/* ------------------------------------------------- sabit metinleri cevir */
function applyStaticText() {
  document.title = t("appTitle");
  document.documentElement.lang = lang;
  const set = (id, key) => { const el = $(id); if (el) el.textContent = t(key); };

  set("#title", "appTitle");
  set("#tagline", "tagline");
  set("#l-family", "family");
  set("#h-family", "familyHint");
  set("#l-length", "length");
  set("#l-code", "code");
  set("#decodeBtn", "decode");
  set("#clearBtn", "clear");
  set("#h-encVehicle", "encVehicle");
  set("#h-encVin2", "encVinCard");
  set("#h-encVin", "encVinHint");
  set("#l-encDonor", "encDonor");
  set("#h-encDonor", "donorHint");
  set("#donorBadge", "donorOptional");
  set("#h-donorPick", "donorPick");
  set("#l-encTail", "encTail");
  set("#h-encTail", "encTailHint");
  set("#genBtn", "encGenerate");
  set("#h-vinTitle", "vinTitle");
  set("#h-vinHint", "encVinHint");
  set("#vinBtn", "vinDecode");
  set("#footerNote", "footerWarn");
  set("#authorNote", "author");

  $("#code").placeholder = t("codePlaceholder");
  $("#encDonor").placeholder = t("codePlaceholder");
  $("#vinInput").placeholder = t("vinPlaceholder");
  $$(".tabs button").forEach((b) => {
    const k = "tab" + b.dataset.tab[0].toUpperCase() + b.dataset.tab.slice(1);
    b.textContent = t(k);
  });
  $("#langBtnWrap")?.remove();
  if (window.mk100) window.mk100.setLang(lang);
  $$(".lang-btn").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
  set("#tbTitle", "appTitle");
}

/* -------------------------------------------------------------- family */
function buildFamilySelect() {
  const sel = $("#family");
  const groups = {};
  for (const o of DS.observations) {
    if (!o.family) continue;
    groups[o.family] = (groups[o.family] || 0) + 1;
  }
  const recWord = t("wordRecord");
  const unsupported = t("famUnsupported");

  // Aileler motor grubuna gore siralanir: her grup ayri bir hesaplayicidir.
  const byGroup = new Map();
  for (const id of DS.familyIds()) {
    const p = getProfile(id);
    if (!byGroup.has(p.group)) byGroup.set(p.group, []);
    byGroup.get(p.group).push({ id, p });
  }

  const parts = [];
  for (const [group, list] of byGroup) {
    const engine = list[0].p.engine;
    const label =
      engine === "mk100" ? t("grpMk100") :
      engine === "mk60ec1" ? t("grpCompact") :
      engine === "esp9" ? t("grpEsp9") :
      engine === "pq46" ? t("grpPq46") : t("grpOther");
    const opts = list.map(({ id, p }) => {
      const f = DS.family(id);
      const tpl = DS.template(id);
      const n = groups[id] || 0;
      // Platform kodlari: en yaygin 3 gosterilir (+n daha)
      const allCodes = [...new Set((f.part_series || []).map((s) => s.split(" ")[0]))];
      const codeTxt = allCodes.length
        ? allCodes.slice(0, 3).join(" / ") + (allCodes.length > 3 ? ` +${allCodes.length - 3}` : "")
        : "?";
      const name = esc(familyLabel(id, lang, f.label));
      const bits = [esc(codeTxt), `${tpl?.default_length ?? "?"}B`];
      if (n) bits.push(`${n} ${recWord}`);
      if (!p.supported) bits.push(unsupported);
      return `<option value="${esc(id)}">${name} — ${bits.join(" — ")}</option>`;
    });
    parts.push(`<optgroup label="${esc(label)}">${opts.join("")}</optgroup>`);
  }
  sel.innerHTML = parts.join("");
  sel.value = localStorage.getItem("mk100.family") || "MQB_MK100";
  fillLength();
  applyProfileNote();
}

/** Secili aile icin motor/uyari bilgisini gosterir. */
function applyProfileNote() {
  const id = $("#family")?.value;
  const box = $("#profileNote");
  if (!box || !id) return;
  const p = getProfile(id);
  let html = "";
  // Platform kodlari: 5Q0 / 5QM / 3Q0 gibi parca numarasi kodalari
  const codes = [...new Set((DS.family(id)?.part_series || []).map((s) => s.split(" ")[0]))];
  if (codes.length) html += `<div class="pn-veh"><b>${t("platformCodes")}:</b> ${esc(codes.join(" · "))}</div>`;
  if (p.vehicles) html += `<div class="pn-veh">${esc(p.vehicles)}</div>`;
  if (p.hwNote) html += `<div class="pn-hw">${esc(p.hwNote)}</div>`;
  if (p.noteKey) {
    const note = PROFILE_NOTES[lang]?.[p.noteKey] || PROFILE_NOTES.tr[p.noteKey];
    if (note) html += `<div class="pn-warn">${esc(note)}</div>`;
  }
  box.innerHTML = html;
  box.hidden = !html;
  // Uretim butonunu desteklenmeyen ailelerde kapat
  const genBtn = $("#genBtn");
  if (genBtn) genBtn.disabled = !p.supported;
}

function fillLength() {
  const fam = $("#family").value;
  const tpl = DS.template(fam);
  const sel = $("#length");
  const lens = new Set();
  if (tpl?.observed_lengths) Object.keys(tpl.observed_lengths).forEach((k) => lens.add(+k));
  if (tpl?.from_reference_length) lens.add(tpl.from_reference_length);
  lens.add(tpl?.default_length || 47);
  const sorted = [...lens].sort((a, b) => a - b);
  const recWord = t("wordRecommended");
  sel.innerHTML = sorted
    .map(
      (n) =>
        `<option value="${n}">${n} ${t("wordBytes")}` +
        `${n === tpl?.default_length ? ` (${recWord})` : ""}</option>`
    )
    .join("");
  sel.value = tpl?.default_length || sorted[0];
}

/* ---------------------------------------------------------------- bind */
function bind() {
  $("#family").addEventListener("change", () => {
    localStorage.setItem("mk100.family", $("#family").value);
    fillLength();
    buildEncodeForm();
    applyProfileNote();
    clearOutput();
  });
  $("#length").addEventListener("change", () => {
    updateVinHint($("#family").value);
    clearOutput();
  });
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $$(".lang-btn").forEach((b) =>
    b.addEventListener("click", () => {
      lang = b.dataset.lang;
      localStorage.setItem("mk100.lang", lang);
      t = makeT(lang);
      const curTab = $(".tabs button.on").dataset.tab;
      applyStaticText();
      buildFamilySelect();
      buildEncodeForm();
      switchTab(curTab);
      if (curTab === "decode" && $("#code").value) runDecode();
      if (curTab === "learn") renderLearn();
      if (curTab === "vin" && $("#vinInput").value) runVin();
    })
  );
  $("#decodeBtn").addEventListener("click", runDecode);
  $("#clearBtn").addEventListener("click", () => { $("#code").value = ""; clearOutput(); });
  $("#code").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runDecode(); } });
  $("#genBtn").addEventListener("click", runEncode);
  $("#vinBtn").addEventListener("click", runVin);
  $("#vinInput").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); runVin(); } });
  $("#encVin").addEventListener("input", () => renderVinInline());
  $("#encTail").addEventListener("change", buildEncodeForm);
}

function switchTab(id) {
  localStorage.setItem("mk100.tab", id);
  $$(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === id));
  $$(".panel").forEach((p) => p.classList.toggle("on", p.id === "p-" + id));
  if (id === "learn") renderLearn();
  if (id === "decode" && $("#code").value) runDecode();
}

function clearOutput() { $("#out").innerHTML = ""; }

async function copyOut() {
  const c = $("#outCode");
  const btn = $("#copyOut");
  if (!c || !btn) return;
  await navigator.clipboard.writeText(c.textContent.replace(/\s+/g, ""));
  flash("#copyOut", t("copied"));
}
function flash(sel, msg) {
  const b = $(sel);
  if (!b) return;
  const old = b.dataset.orig || b.textContent;
  b.dataset.orig = old;
  b.textContent = msg;
  setTimeout(() => (b.textContent = old), 1200);
}

/* =============================================================== DECODE */
function runDecode() {
  const fam = $("#family").value;
  const code = $("#code").value;
  const out = $("#out");
  if (!code.trim()) { out.innerHTML = ""; return; }

  const r = decode(DS, code, { family: fam, length: +$("#length").value, lang });
  if (!r.ok) {
    out.innerHTML = `<div class="notice error"><b>${t("error")}</b>${esc(r.error)}</div>`;
    return;
  }

  const famDef = DS.family(fam);
  const hasMirror = Object.keys(DS.mirrorMap(fam)).length > 0;
let h = "";

  // decode erken cikislarinda warnings/rows gelmeyebilir
  const warnings = Array.isArray(r.warnings) ? r.warnings : [];
  const errCount = warnings.filter((w) => w.level === "error").length;

  h += `<div class="stats">
    <div class="stat"><div class="n">${r.byteCount ?? 0}</div><div class="l">${t("wordBytes")}</div></div>
    ${hasMirror && r.mirror ? `<div class="stat ${r.mirror.ok === r.mirror.checked ? "good" : "bad"}">
        <div class="n">${r.mirror.ok}/${r.mirror.checked}</div><div class="l">${t("mirrorSummary")}</div></div>` : ""}
    <div class="stat ${errCount ? "bad" : ""}">
      <div class="n">${errCount}</div><div class="l">${t("wordErrors")}</div></div>
  </div>`;

  if (!hasMirror && famDef?.mirror_verified)
    h += `<div class="notice warn"><b>${t("mirrorRuleUndefined")}</b>${esc(famDef.mirror_verified)}</div>`;

  for (const w of warnings) h += `<div class="notice ${w.level}">${esc(w[lang] || w.tr || w.en || "")}</div>`;

  // kodlamadan okunan VIN 7-8
  const codingChars = charsFromCoding(r.bytes, fam);
  const m7 = codingChars[7], m8 = codingChars[8];
  if (m7 && m8) {
    const model = VIN_MODEL_CODES[m7 + m8];
    h += `<div class="notice info"><b>${t("codingModelCode")}: ${m7}${m8}</b>` +
      `${model ? esc(model) : t("vinModelUnknown")}` +
      ` <span style="color:var(--fg3)">(VIN[7]=${m7} VIN[8]=${m8})</span></div>`;
  }

  h += `<div class="card"><h2>${t("code")} <span class="hint">${esc(familyLabel(fam, lang, famDef?.label))}</span></h2>
    <div class="out-code" id="outCode">${esc(r.codeSpaced)}</div>
    <div style="margin-top:10px"><button class="btn mini" id="copyOut">${t("copy")}</button></div></div>`;

  h += `<div class="card"><h2>${t("byte")} · ${t("meaning")}</h2>
    <div class="scroll"><table class="tbl"><thead><tr>
      <th>${t("byte")}</th><th>${t("hex")}</th><th>${t("binary")}</th>
      <th class="c-role">${t("role")}</th><th>${t("meaning")}</th><th>${t("status")}</th>
    </tr></thead><tbody>`;

for (const row of r.rows || []) {
    const cls = [
      row.kind === "mirror" ? "mirror-row" : "",
      row.kind === "tail" ? "tail-row" : "",
      row.mirrorOk === false ? "mirror-bad" : "",
    ].join(" ");
    const bits = (row.bits || []).map((b) => `<i class="${b.set ? "on" : ""}">${b.set}</i>`).join("");
    let meaning = row.meaning ? esc(translateMeaning(row.meaning, lang).text) : `<span class="muted">${t("noData")}</span>`;
    if (row.meaning) meaning += ` <span class="badge plain" title="${t("sourceNote")}">${t("source")}</span>`;
    if (row.mirrorOf !== null) {
      meaning += `<div class="mirror-tag ${row.mirrorOk ? "ok" : "bad"}">` +
        (row.mirrorOk ? `✓ ${t("mirrorOf")} B${row.mirrorOf}`
                      : `✗ ${t("mirrorOf")} B${row.mirrorOf} · ${t("mirrorExpected")} ${row.mirrorExpected}`) + `</div>`;
    }
    if (row.observedIn?.length)
      meaning += `<div class="veh-list">${t("observedIn")}: ${esc(row.observedIn.join(", "))}</div>`;
    h += `<tr class="${cls}">
      <td class="c-byte">${row.index}</td>
      <td class="c-hex">${row.value}</td>
      <td class="c-bin"><span class="bits">${bits}</span></td>
      <td class="c-role">${esc(DS.roleLabel(row.role, lang))}${row.kind === "vin" && row.vinDigit ? ` (${row.vinDigit})` : ""}</td>
      <td class="c-mean">${meaning}</td>
      <td>${badge(row.status)}</td></tr>`;
  }
  h += `</tbody></table></div></div>`;

  out.innerHTML = h;
  $("#copyOut").addEventListener("click", copyOut);
}

function badge(status) {
  const map = {
    tested: "evTested", observed: "evObserved", unconfirmed: "evUnconfirmed",
    untested: "evUntested", unknown: "evUnknown", unclassified: "evUnclassified",
    no_description: "evNoDesc", derived: "evDerived",
  };
  return `<span class="badge ${esc(status)}">${t(map[status] || "evUnknown")}</span>`;
}

/* =============================================================== ENCODE */
function buildEncodeForm() {
  const fam = $("#family").value;
  const wrap = $("#encForm");
  const tpl = DS.template(fam);
  const plat = DS.platform(fam);
  if (!tpl || !plat) { wrap.innerHTML = ""; return; }

  // Bayt etiketleri aileye gore degisir; rolden turetilir.
  const MQB_LBL = {
    0: "Vehicle", 2: "Brake", 4: "Front", 6: "Steer", 8: "Epb",
    10: "Drive", 12: "Eds", 14: "Rear",
  };
  const L = (i) => t("encSel" + (MQB_LBL[i] || "Vehicle"));

  const dataBytes = (tpl.byte_template || []).filter((x) => x.kind === "data" && x.index <= 14);
  let h = "";
  for (const b of dataBytes) {
    const opts = optionList(DS, fam, b.index, plat);
    // Rol etiketi varsa onu tercih et (T6/MK60EC1 farkli roller)
    const roleLbl = b.role ? t("role_" + b.role) : "";
    const label = roleLbl && roleLbl !== "role_" + b.role ? roleLbl : L(b.index);
    h += selectField(`b${b.index}`, label, opts);
  }
  wrap.innerHTML = h;

  const tsel = $("#encTail");
  const opts = DS.tailOptions(fam);
  tsel.innerHTML =
    `<option value="">${t("auto")}</option>` +
    opts.map((o) => `<option value="${esc(o.tail)}">${esc(o.tail)} (${o.share}%)</option>`).join("");

  buildDonorPicker(fam);
  updateVinHint(fam);
}

/** VIN zorunlu mu, opsiyonel mi? Veriye bakar. */
function updateVinHint(fam) {
  const len = +$("#length")?.value || DS.template(fam)?.default_length || 0;
  const hint = $("#h-encVin");
  const label = $("#l-vinBadge");
  if (!hint) return;
  const need = vinIsRequired(fam, len);
  hint.textContent = need ? t("vinRequiredHint") : t("vinOptionalHint");
  hint.style.color = need ? "var(--warn)" : "var(--ok)";
  if (label) {
    label.textContent = need ? t("vinRequired") : t("vinOptional");
    label.className = need ? "req-badge" : "opt-badge";
  }
}

/**
 * Donor secici: ayni aileden gercek bir arac kodu secmek, kod elle
 * yazmaktan hem daha kolay hem daha guvenlidir. Secim kutuya yazilir.
 */
function buildDonorPicker(fam) {
  const sel = $("#donorPick");
  if (!sel) return;
  const obs = DS.observationsFor(fam);
  const list = obs
    .filter((o) => o.bytes.length && !o.bytes.every((b) => b === "00"))
    .slice(0, 200);
  const opts = [
    `<option value="">${esc(t("donorPickNone"))}</option>`,
    ...list.map(
      (o) => `<option value="${esc(o.coding)}">${esc(
        `${o.vehicle} [${o.model_code ?? "?"}] ${o.year ?? ""} · ${o.byte_count}B`
      )}</option>`
    ),
  ];
  sel.innerHTML = opts.join("");
  sel.onchange = () => {
    $("#encDonor").value = sel.value || "";
  };
}

/** Secili ailede VIN baytlarinin hepsi sabit mi? */
function vinIsRequired(fam, length) {
  const stats = DS.byteStats(fam, length);
  const tpl = DS.template(fam);
  if (!tpl) return true;
  const vinBytes = tpl.byte_template.filter((x) => x.kind === "vin").map((x) => x.index);
  if (!vinBytes.length) return false;
  return vinBytes.some((i) => !stats[i] || !stats[i].constant);
}

/**
 * Bir bayt icin secim listesi olusturur.
 *
 * Bicim (TR):  24 — T-Roc (en sık 2/5 · ayrıca: Skoda Karoq, VW Golf)
 * Bicim (EN):  24 — T-Roc (most common 2/5 · also: Skoda Karoq, VW Golf)
 *
 * "en sik N/M" = bu deger M aracdan N tanesinde goruldu.
 * "ayrica"     = ayni bayt icin tanimli Diger degerler (en sik 3 tanesi).
 */
function optionList(ds, fam, idx, plat) {
  const map = new Map();
  const b = plat.bytes.find((x) => x.index === idx);
  if (b) for (const v of b.values) if (v.meaning) map.set(v.value, v.meaning);

  const added = ds.validation.values_found_in_vehicles_but_missing_from_reference || {};
  for (const [key, vals] of Object.entries(added)) {
    if (Number(key.replace(/\D/g, "")) !== idx) continue;
    for (const [val, rec] of Object.entries(vals))
      if (rec.meaning_inferred) map.set(val.toUpperCase(), rec.meaning_inferred);
  }

  // Gozlem istatistigi: ayni degerin kac aracda goruldugu + digerleri
  const stats = ds.byteValueStats(fam, idx);

  const out = [...map.entries()]
    .map(([v, meaning]) => {
      const translated = translateMeaning(meaning, lang).text;
      const st = stats?.get(v);
      if (!st) return [v, translated];
      const main = t("optMostCommon", { n: st.count, m: st.total });
      // "ayrica" listesi: ayni baytin diger gozlenen degerleri
      const others = (st.others || [])
        .filter((o) => o.value !== v)
        .slice(0, 3)
        .map((o) => {
          const om = map.get(o.value);
          return om ? translateMeaning(om, lang).text : null;
        })
        .filter(Boolean);
      if (!others.length) return [v, `${translated} · ${main}`];
      return [v, `${translated} · ${main} · ${t("optAlso")}: ${others.join(", ")}`];
    })
    .sort((a, b2) => a[0].localeCompare(b2[0]));
  return out;
}

function selectField(id, label, opts) {
  return `<div class="field"><label>${esc(label)}</label>
    <select id="${id}"><option value="">—</option>
    ${opts.map(([v, m]) => `<option value="${esc(v)}" title="${esc(String(m))}">${esc(v)} — ${esc(String(m).slice(0, 90))}</option>`).join("")}
    </select></div>`;
}

function runEncode() {
  const fam = $("#family").value;
  const spec = {
    family: fam,
    length: +$("#length").value,
    selections: {},
    vin: $("#encVin").value.trim().toUpperCase(),
    donor: $("#encDonor").value.trim(),
    tail: $("#encTail").value,
    equipment: {},
  };
  $$("#encForm select").forEach((s) => { if (s.value) spec.selections[s.id.slice(1)] = s.value; });

  const r = encode(DS, spec);
  const out = $("#genOut");
  if (!r.ok && !r.code) {
    out.innerHTML = `<div class="notice error"><b>${t("error")}</b>${encodeMessages(lang, r.errors).map(esc).join("<br>")}</div>`;
    return;
  }

  let h = "";
  if (!r.ok) {
    h += `<div class="notice warn"><b>${t("incomplete")}</b>${encodeMessages(lang, r.errors).map(esc).join("<br>")}</div>`;
  } else {
    h += `<div class="notice ok"><b>${t("encMirrorAuto")}</b>${r.mirror.ok}/${r.mirror.total} ${t("mirrorPassed")}</div>`;
  }

  h += `<div class="card"><h2>${t("encResult")}</h2>
    <div class="out-code" id="genCode">${esc(r.codeSpaced)}</div>
    <div style="margin-top:10px"><button class="btn mini" id="copyGen">${t("copy")}</button></div></div>`;

  if (r.vin?.used?.length) {
    h += `<div class="card"><h2>VIN</h2><table class="tbl"><tbody>`;
    for (const v of r.vin.used)
      h += `<tr><td class="c-byte">B${v.byte}</td><td class="c-hex">${v.value}</td><td style="color:var(--fg2)">VIN[${v.vin_digit}] = "${v.char}"</td></tr>`;
    h += `</tbody></table>`;
    if (r.vin.fromDonor?.length)
      h += `<div class="hint" style="margin-top:8px">${t("encFromDonor")}: B${r.vin.fromDonor.join(", B")}</div>`;
    h += `</div>`;
  }
if (r.applied.length) {
    h += `<div class="card"><h2>${t("encApplied")}</h2><table class="tbl"><tbody>`;
    for (const a of r.applied)
      h += `<tr><td class="c-byte">B${a.byte}</td><td class="c-hex">${a.value}</td><td>${esc(a.meaning || "-")}</td><td>${badge(a.status)}</td></tr>`;
    h += `</tbody></table></div>`;
  }

  // --- OTOMATIK DOLDURMA RAPORU (donor / en sik / sabit)
  const autoRows = [];
  for (const u of r.unresolved || []) {
    if (u.from === "mirror") continue;
    autoRows.push(u);
  }
  for (const a of r.applied || []) {
    if (a.byte !== undefined && !autoRows.some((x) => x.byte === a.byte) &&
        (a.status === "constant" || a.status === "observed")) {
      autoRows.push({ byte: a.byte, from: "constant", value: a.value });
    }
  }
  if (autoRows.length) {
    autoRows.sort((a, b) => a.byte - b.byte);
    const srcWord = {
      donor: () => t("autoFillDonor"),
      constant: () => t("autoFillConstant"),
      most_common: (u) => t("enSikOf", { n: `${u.share ?? "?"}%` }),
      unknown: () => t("autoFillMostCommon"),
    };
    h += `<div class="card"><h2>${t("autoFillHeader")} <span class="count">${autoRows.length}</span></h2>
      <div class="hint" style="margin-bottom:8px">${t("autoFillNote")}</div>
      <table class="tbl"><thead><tr>
        <th>${t("byteHeader")}</th><th>HEX</th><th>${t("source")}</th>
      </tr></thead><tbody>`;
    for (const u of autoRows) {
      const fn = srcWord[u.from] || srcWord.unknown;
      h += `<tr><td class="c-byte">B${u.byte}</td><td class="c-hex">${u.value || "-"}</td>
        <td style="color:var(--fg2)">${esc(fn(u))}</td></tr>`;
    }
    h += `</tbody></table></div>`;
  }

  if (r.warnings?.length) {
    h += `<div class="notice warn" style="margin-top:10px">${encodeMessages(lang, r.warnings).map(esc).join("<br>")}</div>`;
  }
  if (r.gaps.length)
    h += `<div class="card"><h2>${t("encGaps")}</h2><div class="notice warn">B${r.gaps.join(", B")}</div></div>`;

  out.innerHTML = h;
  $("#copyGen").addEventListener("click", () => {
    navigator.clipboard.writeText(r.code);
    flash("#copyGen", t("copied"));
  });
}

/* ================================================================== VIN */
function runVin() {
  const v = $("#vinInput").value.trim().toUpperCase();
  const out = $("#vinOut");
  const r = decodeVin(v);
  if (!r.ok) {
    out.innerHTML = `<div class="notice warn" style="margin-top:12px">${t("vinInvalid")} (${v.length}/17)</div>`;
    return;
  }
  out.innerHTML = renderVinResult(r);
}

function renderVinInline() {
  const v = $("#encVin").value.trim().toUpperCase();
  const box = $("#vinInline");
  if (!box) return;
  if (v.length < 3) { box.innerHTML = ""; return; }
  const r = decodeVin(v);
  if (!r.ok) { box.innerHTML = `<div class="hint" style="margin-top:6px;color:var(--warn)">${v.length}/17</div>`; return; }
  const bits = [`<b>${r.model}</b>${r.modelLabel ? " " + esc(r.modelLabel) : ""}`];
  if (r.yearLabel) bits.push(`${r.year}=${r.yearLabel}`);
  box.innerHTML = `<div class="hint" style="margin-top:6px">${bits.join(" · ")}</div>`;
}

function renderVinResult(r) {
  const unknown = `<span class="muted">${t("vinUnknownChar")}</span>`;
  const row = (label, value, sub) =>
    `<tr><td class="c-byte" style="width:130px">${label}</td><td class="c-hex">${esc(value)}</td><td>${sub || ""}</td></tr>`;
  let h = `<table class="tbl" style="margin-top:14px"><tbody>`;
  h += row(t("vinWmi"), r.wmi, r.wmiLabel ? esc(r.wmiLabel) : unknown);
  h += row(t("vinModel"), r.model, r.modelLabel ? esc(r.modelLabel) : unknown);
  h += row(t("vinYear"), r.year, r.yearLabel ? esc(r.yearLabel) : unknown);
  h += row(t("vinPlant"), r.plant, r.plantLabel ? esc(r.plantLabel) : unknown);
  h += row(t("vinSerial"), r.serial, "");
  h += `</tbody></table>`;
  h += `<div class="hint" style="margin-top:10px">${t("vinCheckDigit")}</div>`;
  return h;
}

/* ================================================================ LEARN */
function renderLearn() {
  const s = DS.summary();
  let h = `<div class="stats">
    <div class="stat"><div class="n">${esc(s.schema)}</div><div class="l">${t("learnSchema")}</div></div>
    <div class="stat"><div class="n" style="font-size:14px">${esc(s.dataset)}</div><div class="l">${t("learnVersion")}</div></div>
    <div class="stat"><div class="n">${s.families}</div><div class="l">${t("learnFamilies")}</div></div>
    <div class="stat"><div class="n">${s.observations}</div><div class="l">${t("learnObs")}</div></div>
    ${s.uniqueCodings ? `<div class="stat"><div class="n">${s.uniqueCodings}</div><div class="l">${t("learnUniqueCodes")}</div></div>` : ""}
    ${s.partial ? `<div class="stat"><div class="n">${s.partial}</div><div class="l">${t("learnPartial")}</div></div>` : ""}
    ${s.mirrorRate != null ? `<div class="stat ${s.mirrorRate >= 99 ? "good" : "bad"}">
      <div class="n">%${s.mirrorRate}</div><div class="l">${t("learnMirrorRate")}</div></div>` : ""}
  </div>`;

  // --- AILE LISTESI + Ayna DOGRULAMASI (her aile gercek araclarla)
  h += `<div class="card"><h2>${t("learnMirrorRule")}</h2>
    <div class="hint" style="margin-bottom:10px">${t("learnMirrorHint")}</div>
    <div class="scroll"><table class="tbl">
    <thead><tr><th>${t("learnFamily")}</th><th>${t("platformCodes")}</th>
      <th>${t("wordBytes")}</th><th>${t("learnObs")}</th>
      <th>${t("mirrorSummary")}</th><th>${t("status")}</th></tr></thead><tbody>`;
  for (const fid of DS.familyIds()) {
    const f = DS.family(fid);
    const mv = f.mirror_verified || {};
    const codes = [...new Set((f.part_series || []).map((s) => s.split(" ")[0]))];
    const prof = getProfile(fid);
    let badge;
    if (!mv.checked) {
      badge = `<span class="badge unknown">${t("learnNoMirror")}</span>`;
    } else if (mv.pct === 100) {
      badge = `<span class="badge tested">%100</span>`;
    } else if (mv.pct >= 90) {
      badge = `<span class="badge unconfirmed">%${mv.pct}</span>`;
    } else {
      badge = `<span class="badge unknown">%${mv.pct}</span>`;
    }
    h += `<tr><td style="width:150px"><b>${esc(familyLabel(fid, lang, f.label))}</b>
        ${prof.supported ? "" : `<div style="font-size:10.5px;color:var(--fg3)">${t("famUnsupported")}</div>`}</td>
      <td style="font-family:var(--mono);font-size:12px">${esc(codes.join(" · ") || "—")}</td>
      <td>${f.default_length}</td>
      <td>${f.observation_count}</td>
      <td style="font-family:var(--mono)">${mv.checked ? `${mv.ok}/${mv.checked}` : "—"}</td>
      <td>${badge}</td></tr>`;
  }
  h += `</tbody></table></div></div>`;

  // --- Bilinen istisnalar
  const exceptions = [];
  for (const fid of DS.familyIds()) {
    const ex = DS.family(fid)?.mirror_verified?.exceptions || [];
    for (const e of ex) exceptions.push({ fid, ...e });
  }
  if (exceptions.length) {
    h += `<div class="card"><h2>${t("learnExceptions")} <span class="count">${exceptions.length}</span></h2>
      <div class="notice warn">${t("learnExceptionsHint")}</div>
      <table class="tbl"><thead><tr><th>${t("learnFamily")}</th><th>${t("learnVehicle")}</th>
      <th>${t("learnPart")}</th><th>HW/SW</th><th>${t("byte")}</th><th>${t("meaning")}</th></tr></thead><tbody>`;
    for (const e of exceptions) {
      h += `<tr><td>${esc(e.fid)}</td><td>${esc(e.vehicle || "")} ${esc(e.model_code ? `[${e.model_code}]` : "")}</td>
        <td style="font-family:var(--mono);font-size:12px">${esc(e.part_number || "")}</td>
        <td style="font-family:var(--mono);font-size:12px">${esc(e.hardware || "")} / ${esc(e.software || "")}</td>
        <td style="font-family:var(--mono)">${esc(e.pair || "")}</td>
        <td style="font-family:var(--mono);font-size:12px">${esc(e.value || "")}</td></tr>`;
    }
    h += `</tbody></table></div>`;
  }

  h += `<div class="notice info" style="margin-top:12px">${t("learnNote")}</div>`;
  $("#learnOut").innerHTML = h;
}

init();

