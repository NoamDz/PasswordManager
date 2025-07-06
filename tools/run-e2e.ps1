# PowerShell wrapper for running Playwright end-to-end tests on Windows

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to repo root
Set-Location (Join-Path $PSScriptRoot '..')

# 1. Root dev dependencies (Playwright)
if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing root dev dependencies (Playwright)...'
    npm --prefix tools install
    npx playwright install --with-deps
}

# 2. Frontend dependencies
if (-not (Test-Path 'frontend/node_modules')) {
    Write-Host 'Installing frontend dependencies...'
    npm --prefix frontend install --silent
}

# 3. Run Playwright tests
npx playwright test 