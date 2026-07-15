param(
  [Parameter(Mandatory = $true)]
  [string]$SourceImage,
  [Parameter(Mandatory = $true)]
  [string]$PublicDirectory
)

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

function Load-Bitmap {
  param([string]$Path)
  $bitmap = [System.Windows.Media.Imaging.BitmapImage]::new()
  $bitmap.BeginInit()
  $bitmap.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  $bitmap.UriSource = [Uri]$Path
  $bitmap.EndInit()
  $bitmap.Freeze()
  return $bitmap
}

function Write-Png {
  param(
    [System.Windows.Media.Imaging.BitmapSource]$Source,
    [int]$Width,
    [int]$Height,
    [string]$OutputPath,
    [switch]$SocialCanvas
  )

  $visual = [System.Windows.Media.DrawingVisual]::new()
  [System.Windows.Media.RenderOptions]::SetBitmapScalingMode($visual, [System.Windows.Media.BitmapScalingMode]::Fant)
  $context = $visual.RenderOpen()
  if ($SocialCanvas) {
    $ivory = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb(247, 242, 234))
    $context.DrawRectangle($ivory, $null, [System.Windows.Rect]::new(0, 0, $Width, $Height))
    $side = [Math]::Min($Height, 560)
    $context.DrawImage($Source, [System.Windows.Rect]::new(($Width - $side) / 2, ($Height - $side) / 2, $side, $side))
  } else {
    $context.DrawImage($Source, [System.Windows.Rect]::new(0, 0, $Width, $Height))
  }
  $context.Close()

  $bitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($Width, $Height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  $encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
  try { $encoder.Save($stream) } finally { $stream.Dispose() }
}

function Write-Ico {
  param([string[]]$PngPaths, [string]$OutputPath)
  $images = [System.Collections.Generic.List[byte[]]]::new()
  foreach ($path in $PngPaths) { $images.Add([System.IO.File]::ReadAllBytes($path)) }
  $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
  $writer = [System.IO.BinaryWriter]::new($stream)
  try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$images.Count)
    $offset = 6 + (16 * $images.Count)
    for ($index = 0; $index -lt $images.Count; $index += 1) {
      $size = [int]([System.IO.Path]::GetFileNameWithoutExtension($PngPaths[$index]) -replace '\D', '')
      $writer.Write([byte]$(if ($size -ge 256) { 0 } else { $size }))
      $writer.Write([byte]$(if ($size -ge 256) { 0 } else { $size }))
      $writer.Write([byte]0)
      $writer.Write([byte]0)
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]$images[$index].Length)
      $writer.Write([uint32]$offset)
      $offset += $images[$index].Length
    }
    foreach ($image in $images) { $writer.Write($image) }
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

$brandDirectory = Join-Path $PublicDirectory 'assets\brand'
$iconDirectory = Join-Path $PublicDirectory 'icons'
[System.IO.Directory]::CreateDirectory($brandDirectory) | Out-Null
[System.IO.Directory]::CreateDirectory($iconDirectory) | Out-Null

$masterPath = Join-Path $brandDirectory 'cf-home-support-emblem-master.png'
[System.IO.File]::Copy($SourceImage, $masterPath, $true)
$source = Load-Bitmap -Path $masterPath

foreach ($size in @(1024, 512, 256, 128, 64)) {
  Write-Png -Source $source -Width $size -Height $size -OutputPath (Join-Path $brandDirectory "cf-home-support-emblem-$size.png")
}

foreach ($size in @(512, 192, 180, 150, 64, 48, 32, 16)) {
  Write-Png -Source $source -Width $size -Height $size -OutputPath (Join-Path $iconDirectory "logo-$size.png")
}

[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-512.png'), (Join-Path $iconDirectory 'icon-512x512.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-192.png'), (Join-Path $iconDirectory 'icon-192x192.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-180.png'), (Join-Path $iconDirectory 'apple-touch-icon.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-512.png'), (Join-Path $iconDirectory 'maskable-512x512.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-192.png'), (Join-Path $iconDirectory 'maskable-192x192.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-150.png'), (Join-Path $iconDirectory 'mstile-150x150.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-32.png'), (Join-Path $iconDirectory 'favicon-32x32.png'), $true)
[System.IO.File]::Copy((Join-Path $iconDirectory 'logo-16.png'), (Join-Path $iconDirectory 'favicon-16x16.png'), $true)

Write-Png -Source $source -Width 1200 -Height 630 -OutputPath (Join-Path $brandDirectory 'cleanfixharish-social-1200x630.png') -SocialCanvas
Write-Ico -PngPaths @((Join-Path $iconDirectory 'logo-16.png'), (Join-Path $iconDirectory 'logo-32.png'), (Join-Path $iconDirectory 'logo-48.png'), (Join-Path $iconDirectory 'logo-64.png')) -OutputPath (Join-Path $PublicDirectory 'favicon.ico')
