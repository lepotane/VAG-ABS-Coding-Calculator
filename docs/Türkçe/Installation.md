# Kurulum

[English](../Installation.md) · [Türkçe](Installation.md)


## Windows

[Sürümler sayfasından](https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases) indirin.

| Dosya | Açıklama |
|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.3.exe` | Kurulum sihirbazı, kısayol oluşturur. Önerilen. |
| `VAG-ABSCoder-Portable-1.0.0-beta.3.exe` | Tek dosya, kurulum gerektirmez. |

Kurulum sihirbazı dizin seçmenize izin verir ve yönetici yetkisi gerektirmez.

### SmartScreen

Dosyalar imzalı ve zaman damgalıdır. Ön sürümlerde imza sertifikası kendi
kendine üretilmiş (self-signed) olduğu için Windows yine de mavi uyarı penceresi
gösterebilir.

**Diğer bilgiler → Yine de çalıştır** seçin veya CA imzalı sürümü bekleyin.

### İndirmeyi doğrulama

```powershell
Get-AuthenticodeSignature .\VAG-ABSCoder-Setup-1.0.0-beta.3.exe
```

`Status: Valid` ve imzalayan `Samet Muric` olmalı. Başka bir şey dosyanın
değiştirildiği anlamına gelir — çalıştırmayın.

## macOS

```bash
npm run dist:mac
```

`.dmg` üretir. Uygulama imzasız olduğu için Gatekeeper ilk açılışta engeller:

*Sistem Ayarları → Gizlilik ve Güvenlik → "Aç"*

## Linux

```bash
npm run dist:linux
```

`.AppImage` ve `.deb` üretir. AppImage için:

```bash
chmod +x VAG-ABSCoder-*.AppImage
./VAG-ABSCoder-*.AppImage
```

## Gereksinimler

İşletim sistemi dışında hiçbir şey gerekmez. Program internet bağlantısı, Python
veya harici araç gerektirmez.

## Kaldırma

Kurulum dizinini ve Başlat menüsü kaydını silin. Program kendi klasörü dışında
hiçbir veri saklamaz.