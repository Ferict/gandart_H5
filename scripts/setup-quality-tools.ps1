$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$toolsBin = Join-Path $repoRoot '.tools\bin'

function Add-ToPathIfExists {
  param([string]$PathEntry)

  if ((Test-Path $PathEntry) -and -not ($env:PATH.Split(';') -contains $PathEntry)) {
    $env:PATH = "$PathEntry;$env:PATH"
  }
}

function Refresh-LocalToolPath {
  $pythonUserBase = py -c "import site; print(site.USER_BASE)"
  if ($LASTEXITCODE -eq 0 -and $pythonUserBase) {
    Add-ToPathIfExists (Join-Path $pythonUserBase.Trim() 'Scripts')
  }

  Add-ToPathIfExists (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links')
}

function Test-Tool {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-Semgrep {
  Refresh-LocalToolPath
  if (Test-Tool 'semgrep') {
    Write-Host 'Semgrep already installed. Skip.'
    return
  }

  Write-Host 'Installing Semgrep...'
  py -m pip install --user semgrep
  Refresh-LocalToolPath
}

function Install-Vale {
  Refresh-LocalToolPath
  if (Test-Tool 'vale') {
    Write-Host 'Vale already installed. Skip.'
    return
  }

  Write-Host 'Installing Vale...'
  winget install --id errata-ai.Vale -e --accept-package-agreements --accept-source-agreements
  Refresh-LocalToolPath
}

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

  $archivePath = Join-Path $env:TEMP 'reviewdog-latest.tar.gz'
  $extractDir = Join-Path $env:TEMP 'reviewdog-extract'

  if (Test-Path $extractDir) {
    Remove-Item $extractDir -Recurse -Force
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

Install-Semgrep
Install-Vale
Install-Reviewdog
Install-PlaywrightBrowser
Install-Lefthook

Write-Host 'Quality tooling setup completed.'
