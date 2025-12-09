# Create Desktop Shortcut for Incident Response Tabletop Simulator

Write-Host "Creating desktop shortcut..." -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "IR Tabletop Simulator.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $scriptPath "START_SIMULATOR.bat"
$shortcut.WorkingDirectory = $scriptPath
$shortcut.Description = "Incident Response Tabletop Simulator - One-Click Launcher"
$shortcut.IconLocation = "shell32.dll,21" # Shield/security icon from Windows

# Try to use PowerShell icon if available
$psIconPath = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
if (Test-Path $psIconPath) {
    $shortcut.IconLocation = "$psIconPath,0"
}

$shortcut.Save()

Write-Host "✓ Desktop shortcut created: '$shortcutPath'" -ForegroundColor Green
Write-Host ""
Write-Host "You can now double-click the 'IR Tabletop Simulator' icon on your desktop!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close"
