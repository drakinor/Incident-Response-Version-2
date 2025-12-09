# Incident Response Tabletop Simulator - One-Click Launcher
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INCIDENT RESPONSE TABLETOP SIMULATOR" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if ($LASTEXITCODE -ne 0 -or -not $nodeVersion) {
    Write-Host "  X Node.js not installed!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
} else {
    Write-Host "  OK Node.js $nodeVersion" -ForegroundColor Green
}

# Check dependencies
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  OK Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  -> Installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  X npm install failed!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
Write-Host "[3/5] Building..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  X Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  OK Built" -ForegroundColor Green
}

# Build
Write-Host "[3/5] Building..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host "  OK Ready" -ForegroundColor Green
# Stop existing
Write-Host "[4/5] Checking existing..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue 2>$null
Start-Sleep -Seconds 1
Write-Host "  OK Ready" -ForegroundColor Green

# Start server
Write-Host "[5/5] Starting server..." -ForegroundColor Yellow
$job = Start-Process -FilePath "node" -ArgumentList "dist/server.js" -WindowStyle Hidden -PassThru

# Poll for server readiness (up to 10 times, 1s interval)
# Check if server is responding
$maxAttempts = 10
$attempt = 0
$serverReady = $false
while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
    $attempt++
}

if ($serverReady) {
    Write-Host "  OK Server started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  SIMULATOR IS READY!" -ForegroundColor Green  
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "Server running. Close this window to stop." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C or close window to exit." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  X Server did not respond at http://localhost:3000!" -ForegroundColor Red
    Write-Host "Check logs or try running manually: node dist/server.js" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
# Keep running and monitor server process
# Cleanup logic to stop Node.js server on exit
$cleanup = {
    Write-Host "Stopping Node.js server..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
}

# Trap script exit to run cleanup
trap {
    & $cleanup
    break
}

# Keep running
while ($true) {
    Start-Sleep -Seconds 30
}
        Write-Host "  X Server process has exited!" -ForegroundColor Red
        Write-Host "Press Enter to exit."
        Read-Host
        exit 1
    }
}
}
if ($serverReady) {
    Write-Host "  OK Server started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  SIMULATOR IS READY!" -ForegroundColor Green  
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "Server running. Close this window to stop." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C or close window to exit." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  X Server did not start after $maxAttempts seconds!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Keep running
while ($true) {
    Start-Sleep -Seconds 30
}
