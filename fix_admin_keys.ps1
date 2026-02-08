$key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGnpdEvEXt8BAASHEfdFxFZ9RaCt9ZFdFcrftoD6kctC root@vlog"
$path = "C:\ProgramData\ssh\administrators_authorized_keys"

# Check if file exists
if (-not (Test-Path $path)) {
    New-Item -Path $path -ItemType File -Force | Out-Null
    Write-Host "Created $path"
}

# Take ownership and set permissions
takeown /f $path
icacls $path /grant "Administradores:F"

# Add key
Add-Content -Path $path -Value $key -Force
Write-Host "Key added to $path"

# Restart SSHD
Restart-Service sshd
Write-Host "SSHD restarted"
