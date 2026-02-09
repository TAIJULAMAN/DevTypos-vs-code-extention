Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 128, 128
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(255, 30, 30, 30))
$brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font "Arial", 40
$g.DrawString("DT", $font, $brush, 25, 30)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Red, 5)
$g.DrawLine($pen, 25, 95, 105, 90)
$g.DrawLine($pen, 25, 95, 105, 100)
$bmp.Save("c:\Projects\mine\DevTypos\images\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Icon generated successfully."
