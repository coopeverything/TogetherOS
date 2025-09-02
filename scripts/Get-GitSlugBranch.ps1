param()
$ErrorActionPreference = 'Stop'
try {
$inside = git rev-parse --is-inside-work-tree 2>$null
if (-not $inside) { throw 'Not inside a git repo' }
$remote = git remote get-url origin
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -eq 'HEAD' -or [string]::IsNullOrWhiteSpace($branch)) {
    $branch = (git rev-parse --short HEAD).Trim()
}

# Normalize owner/repo slug from SSH or HTTPS
$slug = $null
if ($remote -match 'github\.com[:/](.+?)(?:\.git)?$') {
    $slug = $matches[1]
} else {
    $leaf = Split-Path -Leaf $remote
    $slug = $leaf -replace '\.git$',''
}

Write-Output ("Slug={0}; Branch={1}" -f $slug, $branch)
} catch {
Write-Output ("[FAIL] {0}" -f $_.Exception.Message)
exit 1
}
