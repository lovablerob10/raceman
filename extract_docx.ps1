
Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "d:\Pe de chumbo\Mudancas\briefing site .docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
if ($entry) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()
    
    # Extract text from w:t tags
    $matches = [regex]::Matches($xml, '<w:t.*?>(.*?)</w:t>')
    $text = ($matches | ForEach-Object { $_.Groups[1].Value }) -join " "
    
    # Write to a text file for analysis in UTF8
    $text | Set-Content -Path "d:\Pe de chumbo\briefing_extracted.txt" -Encoding utf8
    Write-Output "Extracted text to briefing_extracted.txt (UTF8)"
}
else {
    $zip.Dispose()
    Write-Error "Could not find word/document.xml in docx"
}
