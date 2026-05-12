Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\naiti\Downloads\aditya-genset-v3\aditya-genset-v3\public\aditya-logo.png"
$target192 = "C:\Users\naiti\Downloads\aditya-genset-v3\aditya-genset-v3\public\pwa-192x192.png"
$target512 = "C:\Users\naiti\Downloads\aditya-genset-v3\aditya-genset-v3\public\pwa-512x512.png"

$img = [System.Drawing.Image]::FromFile($sourcePath)

$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save($target192, [System.Drawing.Imaging.ImageFormat]::Png)
$g192.Dispose()
$bmp192.Dispose()

$bmp512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save($target512, [System.Drawing.Imaging.ImageFormat]::Png)
$g512.Dispose()
$bmp512.Dispose()

$img.Dispose()
