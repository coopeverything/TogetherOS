param(
[Parameter(Mandatory=$true)]
[string]$Path
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Path)) {
Write-Error "File not found: $Path"; exit 1
}

$tokens = $null; $errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($Path, [ref]$tokens, [ref]$errors)

if ($errors -and $errors.Count -gt 0) {
Write-Host "SYNTAX: FAIL" -ForegroundColor Red
foreach ($e in $errors) {
$loc = $e.Extent
$line = $loc.StartLineNumber
$col = $loc.StartColumnNumber
$codeLine = (Get-Content -LiteralPath $Path)[$line-1]
Write-Host ("Line {0}, Col {1}: {2}" -f $line,$col,$e.Message) -ForegroundColor Yellow
Write-Host (" {0}" -f $codeLine)
Write-Host (" {0}{1}" -f (" " * ($col-1)), "^") -ForegroundColor DarkYellow
}
exit 2
}

Write-Host "SYNTAX: OK" -ForegroundColor Green
