# Download go2rtc for Windows
$version = "1.9.1"
$url = "https://github.com/AlexxIT/go2rtc/releases/download/v${version}/go2rtc_win64.exe"
$output = "go2rtc.exe"

Write-Host "Downloading go2rtc v$version..."
Invoke-WebRequest -Uri $url -OutFile $output
Write-Host "✓ Downloaded to $output"
Write-Host "Run: .\go2rtc.exe -c go2rtc.yaml"
