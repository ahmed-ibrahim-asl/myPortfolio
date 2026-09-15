$ErrorActionPreference = 'Stop'
$portfolioRoot = Split-Path -Parent $PSScriptRoot
$portfolioUrl = 'http://localhost:3000'
Set-Location -LiteralPath $portfolioRoot

function Test-Portfolio {
    try {
        $page = Invoke-WebRequest -UseBasicParsing -Uri $portfolioUrl -TimeoutSec 5
        return $page.StatusCode -eq 200 -and $page.Content -match 'Ahmed Asl'
    } catch { return $false }
}

try {
    if (-not (Test-Portfolio)) {
        if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) {
            throw 'Port 3000 is occupied but the portfolio is not responding. No process was stopped. Check the existing server before trying again.'
        }
        $node = (Get-Command node.exe -ErrorAction Stop).Source
        $next = Join-Path $portfolioRoot 'node_modules\next\dist\bin\next'
        if (-not (Test-Path -LiteralPath $next)) {
            throw 'Dependencies are missing. Run npm ci in the portfolio folder, then double-click start.bat again.'
        }
        $logDirectory = Join-Path $portfolioRoot '.autorun'
        New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $outputLog = Join-Path $logDirectory "server-$stamp.log"
        $errorLog = Join-Path $logDirectory "server-$stamp-error.log"
        Write-Host "Starting your portfolio at $portfolioUrl"
        $serverArguments = @(('"' + $next + '"'), 'dev', '--hostname', '127.0.0.1', '--port', '3000')
        $server = Start-Process -FilePath $node -ArgumentList $serverArguments -WorkingDirectory $portfolioRoot -WindowStyle Hidden -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
        $deadline = (Get-Date).AddSeconds(90)
        while (-not (Test-Portfolio)) {
            $server.Refresh()
            if ($server.HasExited -or (Get-Date) -gt $deadline) {
                throw "The server could not start. Read $errorLog and $outputLog for details."
            }
            Start-Sleep -Milliseconds 500
        }
        Write-Host "Server PID: $($server.Id). Logs: $logDirectory"
    } else {
        Write-Host 'Your portfolio is already running; reusing it.'
    }
    Start-Process $portfolioUrl
    Write-Host 'Portfolio opened in your default browser.'
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
