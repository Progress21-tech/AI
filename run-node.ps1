param (
    [string]$Cmd = "node",
    [string[]]$CmdArgs = @()
)

$nodeBin = "C:\Users\DELL\Documents\GitHub\AI\.node\node-v20.18.0-win-x64"
$cleanPaths = ($env:PATH -split ';') | Where-Object { $_ -and ($_ -notlike "*C:\node*") }
$env:PATH = "$nodeBin;" + ($cleanPaths -join ';')

if ($Cmd -eq "node") {
    & "$nodeBin\node.exe" @CmdArgs
} elseif ($Cmd -eq "npm") {
    & "$nodeBin\npm.cmd" @CmdArgs
} elseif ($Cmd -eq "npx") {
    & "$nodeBin\npx.cmd" @CmdArgs
}
