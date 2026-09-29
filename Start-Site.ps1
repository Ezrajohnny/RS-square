$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$ownerUserName = Read-Host 'Create or enter the owner username'
if ([string]::IsNullOrWhiteSpace($ownerUserName)) { throw 'The owner username cannot be blank.' }

$secureOwnerPassword = Read-Host 'Enter the owner password (at least 12 characters)' -AsSecureString
$passwordPointer = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureOwnerPassword)
try {
    $ownerPasswordText = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    if ($ownerPasswordText.Length -lt 12) { throw 'Use a password with at least 12 characters.' }
    $env:RS_ADMIN_USER = $ownerUserName
    $env:RS_ADMIN_PASSWORD = $ownerPasswordText
    Write-Host ''
    Write-Host 'Starting the R.S. Square website.' -ForegroundColor Cyan
    Write-Host 'Keep this window open while you manage the site.' -ForegroundColor DarkGray
    Write-Host 'Website: http://localhost:3000' -ForegroundColor Green
    Write-Host 'Owner page: http://localhost:3000/admin-login.html' -ForegroundColor Green
    Write-Host ''
    node .\server.js
}
finally {
    Remove-Item Env:\RS_ADMIN_USER -ErrorAction SilentlyContinue
    Remove-Item Env:\RS_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    if ($passwordPointer -ne [IntPtr]::Zero) { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer) }
    $ownerPasswordText = $null
}
