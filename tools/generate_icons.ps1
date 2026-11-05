Add-Type -AssemblyName System.Drawing

function Resize-Image($srcPath, $dstPath, $w, $h) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $dst = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dst)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $w, $h)
    $dst.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dst.Dispose()
    $src.Dispose()
}

$logo = (Resolve-Path 'resources\img\logo.png').Path

# Android Launcher Mipmaps
Resize-Image $logo (Resolve-Path 'android\app\src\main\res\mipmap-mdpi\ic_launcher.png').Path 48 48
Resize-Image $logo (Resolve-Path 'android\app\src\main\res\mipmap-hdpi\ic_launcher.png').Path 72 72
Resize-Image $logo (Resolve-Path 'android\app\src\main\res\mipmap-xhdpi\ic_launcher.png').Path 96 96
Resize-Image $logo (Resolve-Path 'android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png').Path 144 144
Resize-Image $logo (Resolve-Path 'android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png').Path 192 192

# Web Icons
Resize-Image $logo (Resolve-Path 'web\favicon.png').Path 32 32
Resize-Image $logo (Resolve-Path 'web\icons\Icon-192.png').Path 192 192
Resize-Image $logo (Resolve-Path 'web\icons\Icon-512.png').Path 512 512
Resize-Image $logo (Resolve-Path 'web\icons\Icon-maskable-192.png').Path 192 192
Resize-Image $logo (Resolve-Path 'web\icons\Icon-maskable-512.png').Path 512 512

# Leanback TV Banner (320x180 landscape)
$src = [System.Drawing.Image]::FromFile($logo)
$banner = New-Object System.Drawing.Bitmap(320, 180)
$gb = [System.Drawing.Graphics]::FromImage($banner)
$gb.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gb.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42)) # AppTheme.darkNavy
$gb.FillRectangle($brush, 0, 0, 320, 180)

# Draw centered logo (120x120) with offset left and 'yivu' text
$logoSize = 130
$logoX = 25
$logoY = (180 - $logoSize) / 2
$gb.DrawImage($src, $logoX, $logoY, $logoSize, $logoSize)

$font = New-Object System.Drawing.Font('Arial', 32, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gb.DrawString('yivu', $font, $textBrush, 165, 60)

$banner.Save((Resolve-Path 'android\app\src\main\res\drawable\tv_banner.png').Path, [System.Drawing.Imaging.ImageFormat]::Png)

$gb.Dispose()
$banner.Dispose()
$src.Dispose()

Write-Output 'All icons and TV banner generated successfully!'

