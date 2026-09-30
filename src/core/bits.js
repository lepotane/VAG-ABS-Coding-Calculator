/**
 * Bit seviyesi yardimcilar.
 *
 * MK100 ayna (mirror) kurali: bir baytin bitleri geriye dogru okundugunda
 * ortaya cikan deger, ayna baytta saklanir.
 *   F4 = 1111 0100  ->  tersi 0010 1111  ->  2F
 *
 * Bu kural MQB Continental MK100 icinde 728 gercek kodlamada
 * 727 kez dogrulanmistir (bkz. dataset meta.rules.mirror_validation).
 */

/** Bir baytin bitlerini ters cevirir (8 bit, bit-reversal). */
export function bitrev(byte) {
  const n = byte & 0xff;
  let r = 0;
  for (let i = 0; i < 8; i++) r = (r << 1) | ((n >> i) & 1);
  return r & 0xff;
}

/** Bayti 8 hane ikili metne cevirir. */
export function toBin(byte) {
  return (byte & 0xff).toString(2).padStart(8, "0");
}

/** Baytin 0..7 bitlerini dizi olarak dondurur (bit0 = en sagdaki). */
export function bitsOf(byte) {
  const out = new Array(8);
  for (let i = 0; i < 8; i++) out[i] = (byte >> i) & 1;
  return out;
}

/** "0~2", "5-7", "1 & 2", "0~1" gibi bit araliklarini [bas,bit] listesine cevirir. */
export function parseBitSpec(spec) {
  if (!spec) return [];
  const s = String(spec).replace(/^bits?/i, "").trim();
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (!nums.length) return [];
  if (/~/.test(s) && nums.length >= 2) {
    const [a, b] = nums;
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  return nums;
}

/** Byte degerini 0-7 arasi bit indeksleri olarak test eder. */
export function testBits(byte, spec) {
  const idx = parseBitSpec(spec);
  if (!idx.length) return null;
  const mask = idx.reduce((m, i) => m | (1 << i), 0);
  return { value: (byte & mask) >>> 0, mask, bits: idx };
}
