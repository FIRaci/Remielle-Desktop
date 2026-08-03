Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:\Remielle-Desktop\assets\waiting_user_input.gif")
$img.Save("d:\Remielle-Desktop\assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
