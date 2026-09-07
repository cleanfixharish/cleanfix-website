$ErrorActionPreference = 'Stop'

$requiredSchedules = @('DAILY', 'WEEKLY', 'MONTHLY')
$maximumBackupAgeHours = 30
$volumeInstances = [ordered]@{
    'Postgres-1' = 'e0cb7a3a-e223-4deb-b232-6c24131c3743'
    'Postgres-2' = '563bd2f0-df64-46bb-a884-68449f1d2530'
    'Postgres-3' = '69ab4fe9-9541-42b8-b633-52af57df30f9'
}

$query = @'
query BackupStatus($volumeInstanceId: String!) {
  schedules: volumeInstanceBackupScheduleList(volumeInstanceId: $volumeInstanceId) {
    kind
    retentionSeconds
  }
  backups: volumeInstanceBackupList(volumeInstanceId: $volumeInstanceId) {
    createdAt
    name
    scheduleId
  }
}
'@

$failures = @()
$results = foreach ($entry in $volumeInstances.GetEnumerator()) {
    $rawResult = & railway api $query --raw-var "volumeInstanceId=$($entry.Value)" --compact
    if ($LASTEXITCODE -ne 0) {
        throw "Railway API query failed for $($entry.Key)."
    }

    $result = $rawResult | ConvertFrom-Json
    if ($result.errors) {
        throw "Railway API returned GraphQL errors for $($entry.Key)."
    }

    $scheduleKinds = @($result.data.schedules.kind | Sort-Object -Unique)
    $missingSchedules = @($requiredSchedules | Where-Object { $_ -notin $scheduleKinds })
    $latestBackup = $result.data.backups |
        Sort-Object { [DateTimeOffset]$_.createdAt } -Descending |
        Select-Object -First 1

    if ($null -eq $latestBackup) {
        $ageHours = $null
        $failures += "$($entry.Key): no backups found"
    }
    else {
        $ageHours = [Math]::Round(
            ([DateTimeOffset]::UtcNow - [DateTimeOffset]$latestBackup.createdAt).TotalHours,
            1
        )
        if ($ageHours -gt $maximumBackupAgeHours) {
            $failures += "$($entry.Key): latest backup is $ageHours hours old"
        }
    }

    if ($missingSchedules.Count -gt 0) {
        $failures += "$($entry.Key): missing schedules $($missingSchedules -join ', ')"
    }

    [pscustomobject]@{
        service = $entry.Key
        schedules = $scheduleKinds
        backupCount = @($result.data.backups).Count
        latestBackupAt = if ($latestBackup) { $latestBackup.createdAt } else { $null }
        latestBackupName = if ($latestBackup) { $latestBackup.name } else { $null }
        ageHours = $ageHours
        missingSchedules = $missingSchedules
    }
}

$results | ConvertTo-Json -Depth 4

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output 'Railway HA backup audit passed.'
