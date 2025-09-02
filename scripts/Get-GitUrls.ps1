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

if ($remote -match 'github\.com[:/](.+?)(?:\.git)?$') {
    $slug = $matches[1]
} else {
    $leaf = Split-Path -Leaf $remote
    $slug = $leaf -replace '\.git$',''
}

$repoUrl = "https://github.com/$slug"
$branchUrl = "$repoUrl/tree/$branch"
Write-Output ("RepoUrl={0}; BranchUrl={1}" -f $repoUrl, $branchUrl)
} catch {
Write-Output ("[FAIL] {0}" -f $_.Exception.Message)
exit 1
}
