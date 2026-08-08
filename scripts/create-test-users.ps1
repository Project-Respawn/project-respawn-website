<#
.SYNOPSIS
Creates the standard Project Respawn Cognito accounts for sandbox/test environments.

.DESCRIPTION
Requires a User Pool ID and permanent password. This script deliberately does not
assign Cognito groups; assign roles separately through Cognito/Admin tooling.

.EXAMPLE
.\scripts\create-test-users.ps1 -UserPoolId "eu-north-1_bobxwoc8n" -Password "Respawn123!"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$UserPoolId,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Password,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$Region = 'eu-north-1'
)

$awsCommand = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsCommand) {
    Write-Error 'AWS CLI is not available. Install and configure the AWS CLI before running this script.'
    exit 1
}

# Standard sandbox identities. To add a new test role/persona, no other code
# changes are needed; simply add its email here, for example:
# "esports@projectrespawn.com"
$users = @(
    'superadmin@projectrespawn.com'
    'admin@projectrespawn.com'
    'staff@projectrespawn.com'
    'moderator@projectrespawn.com'
    'trainer@projectrespawn.com'
    'therapist@projectrespawn.com'
    'streamingpartner@projectrespawn.com'
    'affiliatepartner@projectrespawn.com'
    'member@projectrespawn.com'
    'betamember@projectrespawn.com'
)

$created = [System.Collections.Generic.List[string]]::new()
$alreadyExisted = [System.Collections.Generic.List[string]]::new()
$failed = [System.Collections.Generic.List[string]]::new()

foreach ($email in $users) {
    $lookupArguments = @(
        'cognito-idp', 'admin-get-user'
        '--region', $Region
        '--user-pool-id', $UserPoolId
        '--username', $email
        '--output', 'json'
    )
    $lookupOutput = & $awsCommand.Source @lookupArguments 2>&1
    $lookupExitCode = $LASTEXITCODE

    if ($lookupExitCode -eq 0) {
        Write-Host "Already exists: $email" -ForegroundColor Yellow
        $alreadyExisted.Add($email)
        continue
    }

    $lookupMessage = ($lookupOutput | Out-String)
    if ($lookupMessage -notmatch 'UserNotFoundException') {
        Write-Host "Failed: $email (unable to check whether the user exists)" -ForegroundColor Red
        $failed.Add($email)
        continue
    }

    $createArguments = @(
        'cognito-idp', 'admin-create-user'
        '--region', $Region
        '--user-pool-id', $UserPoolId
        '--username', $email
        '--user-attributes', "Name=email,Value=$email", 'Name=email_verified,Value=true'
        '--message-action', 'SUPPRESS'
        '--output', 'json'
    )
    & $awsCommand.Source @createArguments 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed: $email (user creation failed)" -ForegroundColor Red
        $failed.Add($email)
        continue
    }

    $passwordArguments = @(
        'cognito-idp', 'admin-set-user-password'
        '--region', $Region
        '--user-pool-id', $UserPoolId
        '--username', $email
        '--password', $Password
        '--permanent'
    )
    & $awsCommand.Source @passwordArguments 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed: $email (permanent password assignment failed)" -ForegroundColor Red
        $failed.Add($email)
        continue
    }

    Write-Host "Created: $email" -ForegroundColor Green
    $created.Add($email)
}

Write-Host ''
Write-Host 'Summary' -ForegroundColor Cyan
Write-Host 'Created:'
if ($created.Count) { $created | ForEach-Object { Write-Host "  $_" } } else { Write-Host '  None' }
Write-Host 'Already existed:'
if ($alreadyExisted.Count) { $alreadyExisted | ForEach-Object { Write-Host "  $_" } } else { Write-Host '  None' }
Write-Host 'Failed:'
if ($failed.Count) { $failed | ForEach-Object { Write-Host "  $_" } } else { Write-Host '  None' }

if ($failed.Count -gt 0) {
    exit 1
}

exit 0
