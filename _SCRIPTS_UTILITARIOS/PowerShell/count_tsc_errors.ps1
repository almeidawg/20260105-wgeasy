$file = 'c:\Users\Atendimento\Documents\01VISUALSTUDIO_OFICIAL\sistema\wgeasy\frontend\tsc_output.txt'
$lines = Get-Content $file
$found = @()
foreach ($l in $lines) {
    if ($l -match '^(src/[^\(]+)') { $found += $matches[1] }
}
$found | Group-Object | Sort-Object Count -Descending | Select-Object -First 20 | Format-Table Count, Name -AutoSize
