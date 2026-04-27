param(
    [Parameter(Mandatory = $true)]
    [string]$Source,

    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$userHome = $env:USERPROFILE
$pythonExe = Join-Path $userHome ".codex\\tools\\markitdown\\Scripts\\python.exe"

if (-not (Test-Path $pythonExe)) {
    throw "MarkItDown is not installed at $pythonExe"
}

$isUrl = $Source -match '^[a-zA-Z][a-zA-Z0-9+.-]*://'

if (-not $OutputPath) {
    $tempRoot = Join-Path $env:TEMP "codex-markitdown"
    New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

    if ($isUrl) {
        $baseName = "url"
    } else {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Source)
        if ([string]::IsNullOrWhiteSpace($baseName)) {
            $baseName = "document"
        }
    }

    $safeBaseName = $baseName -replace '[^A-Za-z0-9._-]', '_'
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $OutputPath = Join-Path $tempRoot "$safeBaseName.$timestamp.md"
}

& $pythonExe -m markitdown $Source -o $OutputPath

if ($LASTEXITCODE -ne 0) {
    throw "MarkItDown conversion failed for $Source"
}

if (-not (Test-Path $OutputPath)) {
    throw "MarkItDown did not produce an output file at $OutputPath"
}

Write-Output $OutputPath
