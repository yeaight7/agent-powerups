param(
    [Parameter(Mandatory = $true)]
    [string]$Source,

    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

# Locate MarkItDown: prefer PATH, then MARKITDOWN_HOME env var
$pythonExe = $null

if ($env:MARKITDOWN_HOME) {
    $candidate = Join-Path $env:MARKITDOWN_HOME "Scripts\python.exe"
    if (Test-Path $candidate) {
        $pythonExe = $candidate
    }
}

if (-not $pythonExe) {
    # Fall back to python on PATH
    $pythonExe = "python"
}

# Verify markitdown module is accessible
try {
    & $pythonExe -m markitdown --help 2>&1 | Out-Null
} catch {
    throw "MarkItDown is not available. Install with: pip install markitdown`nOr set MARKITDOWN_HOME to your virtual environment path."
}

$isUrl = $Source -match '^[a-zA-Z][a-zA-Z0-9+.-]*://'

if (-not $OutputPath) {
    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) "markitdown-intake"
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
