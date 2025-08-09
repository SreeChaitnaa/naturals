$ErrorActionPreference = "Stop"
$temp = "$env:TEMP"
$installer = "$temp\ChromeEnterprise.msi"
$driverZip = "$temp\chromedriver.zip"
$extract = "$temp\chromedriver_extract"

$chromeUserData = "D:\Murali\Komprise\chrome_user_data"
$driverDir = "D:\Murali\Komprise\chromedriver-win64"

# 1. Always kill Chrome processes
Write-Host "Killing existing Chrome processes..."
Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clear or create user data folder
if (Test-Path $chromeUserData) {
    Remove-Item "$chromeUserData\*" -Recurse -Force
    Write-Host "Cleared user data at $chromeUserData"
} else {
    New-Item -ItemType Directory -Path $chromeUserData | Out-Null
    Write-Host "Created user data folder at $chromeUserData"
}

# 3. Get latest Stable version from Chrome for Testing API
$stableData = Invoke-RestMethod "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json"
$latestStable = $stableData.channels.Stable.version
Write-Host "Latest stable Chrome version: $latestStable"

# 4. Check installed Chrome version
$chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
  $chromePath = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chromePath)) {
  $chromePath = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"
}
$installed = if (Test-Path $chromePath) { (Get-Item $chromePath).VersionInfo.ProductVersion } else { "" }
Write-Host "Installed Chrome version: $installed"

# 5. Download & install Chrome only if versions differ
if ($installed -ne $latestStable) {
    Write-Host "Downloading offline MSI installer..."
    $msiUrl = "https://dl.google.com/dl/chrome/install/googlechromestandaloneenterprise64.msi"
    Invoke-WebRequest -Uri $msiUrl -OutFile $installer
    Write-Host "Installing Chrome..."
    Start-Process "msiexec.exe" -ArgumentList "/i `"$installer`" /qn /norestart" -Wait
    Remove-Item $installer -Force

    $installed = (Get-Item $chromePath).VersionInfo.ProductVersion
    Write-Host "Installed Chrome version now: $installed"
} else {
    Write-Host "Chrome is up to date. Skipping install."
}

# 6. Handle ChromeDriver
$desired = $latestStable
$currentDriver = $null
$driverExe = "$driverDir\chromedriver.exe"
if (Test-Path $driverExe) {
    $currentDriver = & $driverExe --version | Select-Object -First 1
}
Write-Host "Current driver: $currentDriver"

if ($currentDriver -notlike "*$desired*") {
    Write-Host "Downloading ChromeDriver version $desired..."
    $driverUrl = ($stableData.channels.Stable.downloads.chromedriver | Where-Object { $_.platform -eq "win64" }).url
    Invoke-WebRequest -Uri $driverUrl -OutFile $driverZip

    Expand-Archive -Path $driverZip -DestinationPath $extract -Force
    $exe = Get-ChildItem -Path "$extract" -Filter "chromedriver.exe" -Recurse
    if ($exe) {
        if (Test-Path $driverDir) { Remove-Item "$driverDir\*" -Recurse -Force }
        else { New-Item -ItemType Directory -Path $driverDir | Out-Null }
        Copy-Item "$extract\*" -Destination $driverDir -Recurse -Force
        Write-Host "ChromeDriver updated at $driverDir"
    } else {
        Write-Host "Driver download failed; keeping old driver."
    }
    Remove-Item $driverZip -Force
    Remove-Item $extract -Recurse -Force
} else {
    Write-Host "ChromeDriver is already up to date."
}

# 7. Launch Chrome using fresh user data
Write-Host "Launching Chrome..."
Start-Process -FilePath $chromePath

# 8. Pause before exit
Read-Host "Press Enter to close"
