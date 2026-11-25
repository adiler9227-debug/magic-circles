# Уменьшить JPEG: powershell -File tools/resize.ps1 in.jpg out.jpg 1024 [качество]
param($in,$out,[int]$size,[int]$q=88)
Add-Type -AssemblyName System.Drawing
$src=[System.Drawing.Image]::FromFile((Resolve-Path $in))
$bmp=New-Object System.Drawing.Bitmap $size,$size
$g=[System.Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode='HighQualityBicubic';$g.DrawImage($src,0,0,$size,$size);$g.Dispose();$src.Dispose()
$enc=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'}
$ep=New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality),([System.Int64]$q)
$bmp.Save($out,$enc,$ep);$bmp.Dispose()
