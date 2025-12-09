# 🚀 ONE-CLICK STARTUP GUIDE

## For Non-Technical Users

### First Time Setup (One-Time Only)

1. **Install Node.js** (if not already installed):
   - Go to: https://nodejs.org/
   - Download the **LTS version** (recommended)
   - Run the installer with default settings
   - Restart your computer after installation

### Running the Simulator

**Simply double-click:**
```
START_SIMULATOR.bat
```

That's it! The simulator will:
- ✓ Check if Node.js is installed
- ✓ Install any needed dependencies (first time only)
- ✓ Build the application
- ✓ Start the server
- ✓ Open your browser automatically

## What You'll See

1. A black window will open showing progress:
   ```
   [1/5] Checking Node.js installation...
   [2/5] Checking dependencies...
   [3/5] Building application...
   [4/5] Checking for running instances...
   [5/5] Starting server...
   ✓ SIMULATOR IS READY!
   ```

2. Your browser will automatically open to the simulator

3. **IMPORTANT**: Leave the black window open while using the simulator!

## Stopping the Simulator

Simply close the black command window, or press `Ctrl+C` in the window.

## Troubleshooting

### "Node.js is not installed"
- Install Node.js from https://nodejs.org/
- Restart your computer
- Try running START_SIMULATOR.bat again

### "Port 3000 is already in use"
- Another program is using port 3000
- Restart your computer and try again

### Browser doesn't open automatically
- Manually open a browser and go to: http://localhost:3000

### Something else went wrong
- Close all black windows
- Restart your computer
- Delete the `node_modules` folder (if it exists)
- Run START_SIMULATOR.bat again

## For IT Staff / Technical Users

If you prefer command line:
```powershell
npm install
npm run build
npm start
```

Or use the PowerShell launcher directly:
```powershell
.\launch-simulator.ps1
```

## Files Explained

- **START_SIMULATOR.bat** - Double-click this file to run the simulator
- **launch-simulator.ps1** - The PowerShell script that does the setup
- **README-STARTUP.md** - This file (instructions)

## System Requirements

- Windows 10/11
- Node.js LTS (20.x or newer)
- Modern web browser (Chrome, Edge, Firefox)
- 4GB RAM minimum
- Internet connection (first-time setup only)

## Support

If you encounter issues, contact your IT department with:
1. The error message from the black window
2. Your Windows version
3. Whether Node.js is installed (`node --version` in Command Prompt)
