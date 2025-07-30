# * Split PO file into chunks of 300 lines each
# * This script splits erpnext_cleaned.po into smaller manageable files

param(
    [string]$InputFile = "erpnext_cleaned.po",
    [int]$LinesPerChunk = 300,
    [string]$OutputPrefix = "chunk"
)

# * Configuration variables
$InputPath = Join-Path $PSScriptRoot $InputFile
$OutputDir = Join-Path $PSScriptRoot "chunks"

# * Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Created output directory: $OutputDir"
}

# * Check if input file exists
if (-not (Test-Path $InputPath)) {
    Write-Error "Input file not found: $InputPath"
    exit 1
}

# * Read all lines from the input file
Write-Host "Reading file: $InputPath"
$lines = Get-Content $InputPath -Encoding UTF8
$totalLines = $lines.Count
Write-Host "Total lines: $totalLines"

# * Calculate number of chunks needed
$chunkCount = [math]::Ceiling($totalLines / $LinesPerChunk)
Write-Host "Will create $chunkCount chunks of $LinesPerChunk lines each"

# * Split the file into chunks
$chunkNumber = 1
$startLine = 0

while ($startLine -lt $totalLines) {
    $endLine = [math]::Min($startLine + $LinesPerChunk - 1, $totalLines - 1)
    $chunkLines = $lines[$startLine..$endLine]
    
    # * Generate output filename with zero-padded chunk number
    $outputFileName = "{0}_{1:D3}_{2}-{3}.po" -f $OutputPrefix, $chunkNumber, ($startLine + 1), ($endLine + 1)
    $outputPath = Join-Path $OutputDir $outputFileName
    
    # * Write chunk to file
    $chunkLines | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host ("Created chunk {0}: {1} ({2} lines)" -f $chunkNumber, $outputFileName, $chunkLines.Count)
    
    $startLine = $endLine + 1
    $chunkNumber++
}

Write-Host "`nSplitting completed successfully!"
Write-Host "Output directory: $OutputDir"
Write-Host "Total chunks created: $($chunkNumber - 1)" 