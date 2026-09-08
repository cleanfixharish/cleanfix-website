[CmdletBinding()]
param(
    [string]$ProjectId = '3f6760b5-4e65-404d-9918-ba7559fe2a0d',
    [string]$ProductionEnvironmentId = 'fe66a5db-af15-446a-8adb-3010f4e7b52d',
    [string]$IsolatedEnvironmentId = 'ed08a347-3b11-473f-94bc-0c345a0c6301',
    [string]$ExpectedIsolatedEnvironmentName = 'staging-isolated'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-RailwayJson {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments,
        [Parameter(Mandatory)]
        [string]$Operation
    )

    $raw = & railway @Arguments 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Railway $Operation failed. Confirm CLI authentication and identifiers; no restore was attempted."
    }
    try {
        return $raw | ConvertFrom-Json
    }
    catch {
        throw "Railway $Operation returned unexpected non-JSON output."
    }
}

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    throw 'Railway CLI is not installed or is not on PATH.'
}

if ($ProductionEnvironmentId -eq $IsolatedEnvironmentId) {
    throw 'Safety failure: production and isolated environment IDs are identical.'
}

$environmentQuery = @'
query ProjectEnvironments($projectId: String!) {
  project(id: $projectId) {
    environments {
      edges {
        node { id name }
      }
    }
  }
}
'@

$environmentResult = Invoke-RailwayJson -Operation 'environment inventory' -Arguments @(
    'api', $environmentQuery,
    '--raw-var', "projectId=$ProjectId",
    '--compact'
)

$environmentErrors = @($environmentResult.PSObject.Properties | Where-Object { $_.Name -eq 'errors' })
if ($environmentErrors.Count -gt 0 -and $environmentErrors[0].Value) {
    throw 'Railway returned GraphQL errors for the environment inventory.'
}

$environments = @($environmentResult.data.project.environments.edges | ForEach-Object { $_.node })
$production = $environments | Where-Object { $_.id -eq $ProductionEnvironmentId } | Select-Object -First 1
$isolated = $environments | Where-Object { $_.id -eq $IsolatedEnvironmentId } | Select-Object -First 1

if (-not $production) {
    throw 'Configured production environment ID was not found in the configured project.'
}
if (-not $isolated) {
    throw 'Configured isolated environment ID was not found in the configured project.'
}
if ($isolated.name -ne $ExpectedIsolatedEnvironmentName) {
    throw "Configured isolated environment has unexpected name '$($isolated.name)'."
}
if ($production.name -ne 'production') {
    throw "Configured production environment has unexpected name '$($production.name)'."
}

$isolatedServices = Invoke-RailwayJson -Operation 'isolated service inventory' -Arguments @(
    'service', 'list',
    '--project', $ProjectId,
    '--environment', $IsolatedEnvironmentId,
    '--json'
)

$databaseServices = @(
    $isolatedServices | Where-Object {
        $_.source.image -match 'postgres' -or $_.name -match 'postgres'
    }
)
$applicationServices = @(
    $isolatedServices | Where-Object {
        -not ($_.source.image -match 'postgres' -or $_.name -match 'postgres')
    }
)

if ($databaseServices.Count -lt 1) {
    throw 'No PostgreSQL service was found in the isolated environment.'
}
if ($applicationServices.Count -lt 1) {
    throw 'No application service was found in the isolated environment.'
}

$notReady = @($isolatedServices | Where-Object {
    $_.status -ne 'SUCCESS' -or $_.deploymentStopped -eq $true
})
if ($notReady.Count -gt 0) {
    throw 'One or more isolated services are not in a successful running state.'
}

$backupAudit = Join-Path $PSScriptRoot 'audit_railway_backups.ps1'
if (-not (Test-Path -LiteralPath $backupAudit)) {
    throw 'The required HA backup audit script is missing.'
}

& $backupAudit
if ($LASTEXITCODE -ne 0) {
    throw 'The HA backup audit failed. Do not begin a restore drill.'
}

[pscustomobject]@{
    mode = 'read_only_preflight'
    projectId = $ProjectId
    productionEnvironment = [pscustomobject]@{
        id = $production.id
        name = $production.name
    }
    isolatedEnvironment = [pscustomobject]@{
        id = $isolated.id
        name = $isolated.name
    }
    isolatedApplicationServices = @($applicationServices | ForEach-Object {
        [pscustomobject]@{ id = $_.id; name = $_.name; status = $_.status }
    })
    isolatedDatabaseServices = @($databaseServices | ForEach-Object {
        [pscustomobject]@{ id = $_.id; name = $_.name; status = $_.status }
    })
    backups = 'passed'
    restoreAttempted = $false
    nextAction = 'Obtain owner approval for an exact backup and isolated destination before any restore mutation.'
} | ConvertTo-Json -Depth 5

Write-Output 'Railway isolated restore preflight passed. No restore or resource mutation was attempted.'
