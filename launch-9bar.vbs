Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
strDir = FSO.GetParentFolderName(WScript.ScriptFullName)
strExe = strDir & "\src-tauri\target\release\ninebar.exe"

If FSO.FileExists(strExe) Then
    WshShell.Run """" & strExe & """", 0, False
Else
    MsgBox "9Bar executable not found at: " & vbCrLf & strExe & vbCrLf & vbCrLf & "Please run 'npm run build:app' first.", vbExclamation, "9Bar Launcher"
End If
