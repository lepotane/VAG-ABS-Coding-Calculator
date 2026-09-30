/**
 * SignPath sonrasi imzalama (electron-builder afterSign hook).
 *
 * SignPath ücretsiz imza servisini acik kaynak projeler icin saglar.
 * Basvuru: https://open-source.signpath.io
 *
 * Bu hook electron-builder tarafindan cagrilir:
 *   electron-builder --win  ->  uretilen her installer/portable exe imzalanir
 *
 * Gereken ortam degiskenleri (SignPath dashboard'dan alinir):
 *   SIGNPATH_CLI_TOKEN_FILE  veya  SIGNPATH_CLI_TOKEN
 *
 * Depo kurallarina gore imzalama CI icinde calismalidir; bu dosya
 * yalnizca yonlendirme yapar ve token yoksa sessizce gecer.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const projectSlug = process.env.SIGNPATH_PROJECT_SLUG || "";

/**
 * @param {{ electronPlatformName: string }} ctx
 */
export default async function afterSign(ctx) {
  if (!projectSlug) {
    console.log("[signpath] SIGNPATH_PROJECT_SLUG tanimli degil, imzalama atlandi.");
    return;
  }

  const exePath = ctx.electronPlatformName === "win32"
    ? ctx.path
    : join(ctx.outDir, ctx.electronPlatformName === "darwin"
        ? `${ctx.packager.appInfo.productFilename}.app`
        : ctx.packager.appInfo.productFilename);

  if (!existsSync(exePath)) {
    console.log(`[signpath] imzalanacak dosya yok: ${exePath}`);
    return;
  }

  // Token dosyasi mumkunse gecici olarak indirilecek
  const tokenFile = process.env.SIGNPATH_CLI_TOKEN_FILE;
  if (tokenFile && existsSync(tokenFile)) {
    process.env.SIGNPATH_CLI_TOKEN = readFileSync(tokenFile, "utf8").trim();
  }

  const token = process.env.SIGNPATH_CLI_TOKEN;
  if (!token) {
    console.log("[signpath] CLI token yok, imzalama atlandi.");
    return;
  }

  const cli = process.env.SIGNPATH_CLI_PATH || "signpath-cli";
  const config = process.env.SIGNPATH_CONFIG_URL ||
    `https://api.signpath.io`;

  console.log(`[signpath] imzalanıyor: ${exePath}`);
  execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["signpath-cli", "sign", exePath, "--api-url", config, "--project-slug", projectSlug],
    { stdio: "inherit", env: { ...process.env } }
  );

  console.log("[signpath] imzalama tamamlandi.");
  void cli; void resolve; void rmSync;
}