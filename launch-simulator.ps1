# Incident Response Tabletop Simulator - One-Click Launcher
# This script handles all setup and launches the application

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INCIDENT RESPONSE TABLETOP SIMULATOR" -ForegroundColor Cyan
Write-Host "  One-Click Launcher" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  ✓ Node.js $nodeVersion found" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "  ✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js LTS from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, run this launcher again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "  → Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Build TypeScript
Write-Host "[3/5] Building application..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Application built successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Kill any existing Node.js processes (in case server is already running)
Write-Host "[4/5] Checking for running instances..." -ForegroundColor Yellow
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "  → Stopping existing server..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "  ✓ Existing server stopped" -ForegroundColor Green
} else {
    Write-Host "  ✓ No existing instances found" -ForegroundColor Green
}

# Start the server in background
Write-Host "[5/5] Starting server..." -ForegroundColor Yellow
$serverJob = Start-Process -FilePath "node" -ArgumentList "dist/server.js" -WindowStyle Hidden -PassThru

# Wait for server to start (check if port 3000 is listening)
$serverReady = $false
$attempts = 0
$maxAttempts = 10

while (-not $serverReady -and $attempts -lt $maxAttempts) {
    Start-Sleep -Seconds 1
    $attempts++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        $serverReady = $true
    } catch {
        # Server not ready yet
    }
}

if ($serverReady) {
    Write-Host "  ✓ Server started successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✓ SIMULATOR IS READY!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening browser to http://localhost:3000..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To stop the simulator, close this window or press Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
    
    # Open browser
    Start-Process "http://localhost:3000"
    
    # Keep the window open and monitor the server
    Write-Host "Server is running. Logs:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Keep script running and show it's active
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            # Check if server process is still running
            if (-not (Get-Process -Id $serverJob.Id -ErrorAction SilentlyContinue)) {
                Write-Host ""
                Write-Host "Server has stopped." -ForegroundColor Red
                break
            }
        }
    } finally {
        # Cleanup on exit
        Write-Host ""
        Write-Host "Shutting down server..." -ForegroundColor Yellow
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Host "Server stopped. You can close this window." -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ Server failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check for errors and try again." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Read-Host "Press Enter to exit"
    exit 1
}
