' Incident Response Tabletop Simulator - Silent Launcher
' This runs the batch file without showing the PowerShell window initially

Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the script directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Change to script directory
objShell.CurrentDirectory = scriptDir

' Run the batch file (window will show for status)
objShell.Run "START_SIMULATOR.bat", 1, False

Set objShell = Nothing
Set fso = Nothing
