# Kendi imza sertifikasini olusturur (self-signed) ve EXE'leri imzalar.
#
# Kullanim:
#   1) .\scripts\make-cert.ps1            -> sertifika olusturur (bir kez)
#   2) .\scripts\make-cert.ps1 -Sign      -> release\*.exe dosyalarini imzalar
#
# Bu sertifika Windows'ta "Guvenilir Kok Sertifika" olarak kurulmadigi icin
# SmartScreen uyarisi DEVAM EDER. Ancak "Bilinmeyen yayimci" yerine sertifika
# sahibi gorunur ve dosya bozulmaya karsi korunur.
#
# Gercek SmartScreen kaldirmak icin CA tarafindan verilen imzalama
# sertifikasi gerekir (DigiCert, Sectigo, GlobalSign, Azure Trusted Signing).

param(
  [switch]$Sign,
  [string]$Password = "",
  [string]$PfxPath = "$PSScriptRoot\..\build\codesign.pfx"
)

$ErrorActionPreference = "Stop"

function Get-SignTool {
  $candidates = @(
    "C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe",
    "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe"
  )
  foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
  # Windows Kits yuklu degilse winget ile kur
  throw "signtool.exe bulunamadi. 'Windows SDK' kurun: winget install Microsoft.WindowsSDK"
}

# ---------------------------------------------------------------- sertifika olustur
if (-not $Sign) {
  if (Test-Path $PfxPath) {
    Write-Host "Sertifika zaten var: $PfxPath" -ForegroundColor Yellow
    Write-Host "Yeniden uretmek icin once silin: Remove-Item '$PfxPath'" -ForegroundColor Yellow
    exit 0
  }

  if (-not $Password) {
    $Password = Read-Host "Sertifika parolasi (bos birakilabilir)" -AsSecureString
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
      [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
  }

  Write-Host "Kod imzalama sertifikasi olusturuluyor..." -ForegroundColor Cyan
  $cert = New-SelfSignedCertificate `
    -Subject "CN=Samet Muric, O=Samet Muric, C=TR" `
    -Type CodeSigningCert `
    -KeyUsage DigitalSignature `
    -KeyExportPolicy Exportable `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(5)

  $sec = ConvertTo-SecureString -String $Password -AsPlainText -Force
  Export-PfxCertificate -Cert $cert -FilePath $PfxPath -Password $sec | Out-Null

  Write-Host "Sertifika olusturuldu: $PfxPath" -ForegroundColor Green
  Write-Host ""
  Write-Host "IMZALAMAK ICIN (her build'de otomatik):" -ForegroundColor Cyan
  Write-Host '  $env:CSC_LINK = "' -NoNewline -ForegroundColor Yellow
  Write-Host (Resolve-Path $PfxPath) -NoNewline -ForegroundColor Yellow
  Write-Host '"' -ForegroundColor Yellow
  Write-Host '  $env:CSC_KEY_PASSWORD = "<parola>"' -ForegroundColor Yellow
  Write-Host ""
  Write-Host "VEYA tek seferlik elle imza:" -ForegroundColor Cyan
  Write-Host "  .\scripts\make-cert.ps1 -Sign" -ForegroundColor Yellow
  exit 0
}

# ---------------------------------------------------------------- imzala
if (-not (Test-Path $PfxPath)) {
  throw "Sertifika bulunamadi: $PfxPath  (once sertifika olusturun)"
}

$exes = Get-ChildItem "$PSScriptRoot\..\release\*.exe" -ErrorAction SilentlyContinue
if (-not $exes) { throw "release\ klasorunde EXE bulunamadi" }

if (-not $Password) {
  $Password = Read-Host "Sertifika parolasi" -AsSecureString
  $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))
}

$signtool = Get-SignTool
$tsUrl = "http://timestamp.digicert.com"

foreach ($e in $exes) {
  Write-Host "Imzalaniyor: $($e.Name)" -ForegroundColor Cyan
  # /tr: timestamp sunucusu  /td: algoritma (tarih DEGISKEN degil)
  & $signtool sign /fd SHA256 /tr $tsUrl /td SHA256 `
    /f $PfxPath /p $Password $e.FullName
  if ($LASTEXITCODE -ne 0) { throw "Imzalama basarisiz: $($e.Name)" }
}

Write-Host ""
Write-Host "Imzalandi:" -ForegroundColor Green
foreach ($e in $exes) {
  $sig = Get-AuthenticodeSignature $e.FullName
  # Kendi imzali (self-signed) sertifikada Status UnknownError doner:
  # imza gecerli, ama kok sertifika Windows'ta guvenilir degil.
  $note = switch ($sig.Status) {
    "Valid" { "gecerli" }
    "UnknownError" { "imzali (kok sertifika guvenilir degil - SmartScreen devam eder)" }
    default { $sig.Status }
  }
  Write-Host ("  {0,-42} {1}" -f $e.Name, $note)
}

Write-Host ""
Write-Host "Zaman damgasi:" -ForegroundColor Cyan
# verify komutu guvenilir olmayan kok sertifika icin hata doner; bu normal.
$old = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$verifyLog = & $signtool verify /pa /v $exes[0].FullName 2>&1 | Out-String
$ErrorActionPreference = $old
$verifyLog -split "`r?`n" |
  Where-Object { $_ -match "Issued to: Samet|timestamped" } |
  ForEach-Object { "  " + $_.Trim() }
Write-Host ""
Write-Host "Not: 'chain terminated in a root' uyarisi kendi imzali sertifikanin" -ForegroundColor DarkGray
Write-Host "Windows kok deposunda olmamasindan kaynaklanir. Imza gecerlidir." -ForegroundColor DarkGray