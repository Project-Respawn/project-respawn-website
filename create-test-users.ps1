$UserPoolId = "eu-north-1_49zQIXgjh"
$Password = "RespawnTest123!"

$Users = @(
    @{ Email = "staff@respawntest.com"; Group = "Staff" },
    @{ Email = "moderator@respawntest.com"; Group = "Moderator" },
    @{ Email = "trainer@respawntest.com"; Group = "Trainer" },
    @{ Email = "therapist@respawntest.com"; Group = "Therapist" },
    @{ Email = "streamingpartner@respawntest.com"; Group = "StreamingPartner" },
    @{ Email = "affiliatepartner@respawntest.com"; Group = "AffiliatePartner" },
    @{ Email = "member@respawntest.com"; Group = "Member" },
    @{ Email = "betamember@respawntest.com"; Group = "BetaMember" }
)

foreach ($User in $Users) {
    $Email = $User.Email
    $Group = $User.Group

    Write-Host "Creating $Email -> $Group" -ForegroundColor Cyan

    aws cognito-idp admin-create-user --user-pool-id $UserPoolId --username $Email --user-attributes Name=email,Value=$Email Name=email_verified,Value=true --message-action SUPPRESS
    aws cognito-idp admin-set-user-password --user-pool-id $UserPoolId --username $Email --password $Password --permanent
    aws cognito-idp admin-add-user-to-group --user-pool-id $UserPoolId --username $Email --group-name $Group
    aws cognito-idp admin-get-user --user-pool-id $UserPoolId --username $Email --query "UserStatus"

    Write-Host "Done: $Email" -ForegroundColor Green
    Write-Host "-----------------------------"
}