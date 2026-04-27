$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$toolsBin = Join-Path $repoRoot '.tools\bin'

function Install-Reviewdog {
  $reviewdogExe = Join-Path $toolsBin 'reviewdog.exe'
  if (Test-Path $reviewdogExe) {
    Write-Host 'Reviewdog already installed. Skip.'
    return
  }

  Write-Host 'Installing Reviewdog...'
  New-Item -ItemType Directory -Path $toolsBin -Force | Out-Null

  $release = Invoke-RestMethod -Headers @{ 'User-Agent' = 'tianyi-quality-setup' } -Uri 'https://api.github.com/repos/reviewdog/reviewdog/releases/latest'
  $asset = $release.assets | Where-Object { $_.name -match 'Windows_x86_64\.tar\.gz$' } | Select-Object -First 1

  if (-not $asset) {
    throw 'Reviewdog Windows x86_64 asset was not found.'
  }

  $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $archivePath = Join-Path $env:TEMP "reviewdog-latest-$PID-$timestamp.tar.gz"
  $extractDir = Join-Path $env:TEMP "reviewdog-extract-$PID-$timestamp"

  if (Test-Path $extractDir) {
    throw "Reviewdog extraction directory already exists: $extractDir"
  }

  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $archivePath
  New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
  tar -xzf $archivePath -C $extractDir

  $binary = Get-ChildItem -Path $extractDir -Filter 'reviewdog.exe' -Recurse | Select-Object -First 1
  if (-not $binary) {
    throw 'reviewdog.exe was not found after download.'
  }

  Copy-Item $binary.FullName $reviewdogExe -Force
}

function Install-PlaywrightBrowser {
  Write-Host 'Installing Playwright Chromium browser...'
  Push-Location $repoRoot
  try {
    npx playwright install chromium
  } finally {
    Pop-Location
  }
}

function Install-Lefthook {
  Write-Host 'Installing Git hooks...'
  Push-Location $repoRoot
  try {
    npx lefthook install
  } finally {
    Pop-Location
  }
}

Install-Reviewdog
Install-PlaywrightBrowser
Install-Lefthook

Write-Host 'Quality tooling setup completed.'
