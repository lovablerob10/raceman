$path = "C:\ProgramData\ssh\sshd_config"
$content = Get-Content $path -Raw

# Enable PasswordAuthentication
if ($content -match "#PasswordAuthentication yes") {
    $content = $content -replace "#PasswordAuthentication yes", "PasswordAuthentication yes"
    Write-Host "Enabled PasswordAuthentication."
}

# Comment out administrators restriction
# We use regex to match the block. \s+ matches newlines and spaces.
$pattern = "Match Group administrators\s+AuthorizedKeysFile __PROGRAMDATA__/ssh/administrators_authorized_keys"
if ($content -match $pattern) {
    # We replace with commented out version. We need to be careful with formatting.
    # The replacement string:
    $replacement = "#Match Group administrators`r`n#       AuthorizedKeysFile __PROGRAMDATA__/ssh/administrators_authorized_keys"
    $content = $content -replace $pattern, $replacement
    Write-Host "Commented out administrators restrictions."
} else {
    Write-Host "Administrators restriction pattern not found or already modified."
}

Set-Content -Path $path -Value $content
Restart-Service sshd
Write-Host "sshd service restarted."
