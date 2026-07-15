param(
  [Parameter(Mandatory = $true)]
  [string]$SourceDirectory
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

function Write-Jpeg {
  param(
    [System.Windows.Media.Imaging.BitmapSource]$Source,
    [int]$Width,
    [string]$OutputPath
  )

  $height = [int][Math]::Round($Width * $Source.PixelHeight / $Source.PixelWidth)
  $visual = [System.Windows.Media.DrawingVisual]::new()
  [System.Windows.Media.RenderOptions]::SetBitmapScalingMode($visual, [System.Windows.Media.BitmapScalingMode]::Fant)
  $context = $visual.RenderOpen()
  $context.DrawImage($Source, [System.Windows.Rect]::new(0, 0, $Width, $height))
  $context.Close()
  $bitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($Width, $height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  $encoder = [System.Windows.Media.Imaging.JpegBitmapEncoder]::new()
  $encoder.QualityLevel = 88
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
  try { $encoder.Save($stream) } finally { $stream.Dispose() }
}

$outputDirectory = Join-Path $SourceDirectory 'web'
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

Get-ChildItem -LiteralPath $SourceDirectory -Filter '*.png' -File | ForEach-Object {
  $source = Load-Bitmap -Path $_.FullName
  $widths = if ($source.PixelWidth -gt $source.PixelHeight) { @(1536, 960, 640) } else { @(1024, 640, 384) }
  foreach ($width in $widths) {
    if ($width -le $source.PixelWidth) {
      $outputName = '{0}-{1}.jpg' -f $_.BaseName, $width
      Write-Jpeg -Source $source -Width $width -OutputPath (Join-Path $outputDirectory $outputName)
    }
  }
}
