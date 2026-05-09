param(
  [string]$Message = "Update pet care site"
)

$ErrorActionPreference = "Stop"

$gitDir = ".git-store"
$workTree = "."
$remote = "origin"
$branch = "main"

if (-not (Test-Path $gitDir)) {
  git --git-dir=$gitDir --work-tree=$workTree init
}

$remoteUrl = "https://github.com/accompany1ike/pet_care.git"
$existingRemote = git --git-dir=$gitDir --work-tree=$workTree remote 2>$null
if ($existingRemote -notcontains $remote) {
  git --git-dir=$gitDir --work-tree=$workTree remote add $remote $remoteUrl
}

git --git-dir=$gitDir --work-tree=$workTree add -f .gitignore
git --git-dir=$gitDir --work-tree=$workTree add index.html assets push.ps1

$changes = git --git-dir=$gitDir --work-tree=$workTree status --short
if ($changes) {
  git --git-dir=$gitDir --work-tree=$workTree commit -m $Message
}

git --git-dir=$gitDir --work-tree=$workTree branch -M $branch
git --git-dir=$gitDir --work-tree=$workTree push -u $remote $branch
