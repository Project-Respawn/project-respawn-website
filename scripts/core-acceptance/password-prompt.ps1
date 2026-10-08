param([Parameter(Mandatory=$true)][string]$Nonce,[Parameter(Mandatory=$true)][int]$Port)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$form = New-Object System.Windows.Forms.Form
$form.Text = 'Project Respawn — existing Ntgre test sign-in'
$form.Size = New-Object System.Drawing.Size(540,220)
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$label = New-Object System.Windows.Forms.Label
$label.Text = "Enter the existing password for member@respawntest.test.`r`nOne ordinary-user verification run. No account or AWS infrastructure changes.`r`nThe password stays in memory and is not saved or sent to chat."
$label.Location = New-Object System.Drawing.Point(15,15)
$label.Size = New-Object System.Drawing.Size(495,65)
$passwordBox = New-Object System.Windows.Forms.TextBox
$passwordBox.Location = New-Object System.Drawing.Point(15,88)
$passwordBox.Size = New-Object System.Drawing.Size(495,26)
$passwordBox.UseSystemPasswordChar = $true
$submit = New-Object System.Windows.Forms.Button
$submit.Text = 'Sign in and run checks'
$submit.Location = New-Object System.Drawing.Point(15,128)
$submit.Size = New-Object System.Drawing.Size(220,30)
$submit.Add_Click({
  if ([string]::IsNullOrEmpty($passwordBox.Text)) { return }
  try {
    $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1',$Port)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Nonce + "`n" + $passwordBox.Text)
    $stream = $client.GetStream()
    $stream.Write($bytes,0,$bytes.Length)
    $stream.Dispose()
    $client.Dispose()
    [Array]::Clear($bytes,0,$bytes.Length)
    $passwordBox.Clear()
    $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.Close()
  } catch {
    $passwordBox.Clear()
    $label.Text = 'Local verification connection failed. No credentials were recorded.'
  }
})
$form.Controls.AddRange(@($label,$passwordBox,$submit))
$form.AcceptButton = $submit
[void]$form.ShowDialog()
$passwordBox.Clear()
$form.Dispose()
