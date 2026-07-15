param(
  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory
)

Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

function Write-PrecisionIcon {
  param(
    [Parameter(Mandatory = $true)]
    [int]$Size,
    [Parameter(Mandatory = $true)]
    [string]$OutputPath
  )

  $visual = [System.Windows.Media.DrawingVisual]::new()
  $context = $visual.RenderOpen()
  $scale = $Size / 256.0
  $context.PushTransform([System.Windows.Media.ScaleTransform]::new($scale, $scale))

  $ivory = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb(247, 242, 234))
  $teal = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb(23, 63, 70))
  $brass = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromRgb(184, 144, 91))

  $context.DrawRoundedRectangle($ivory, $null, [System.Windows.Rect]::new(8, 8, 240, 240), 64, 64)

  $cPen = [System.Windows.Media.Pen]::new($teal, 25)
  $cPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round
  $cPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
  $context.DrawGeometry($null, $cPen, [System.Windows.Media.Geometry]::Parse('M174,66 A78,78 0 1 0 174,190'))

  $fPen = [System.Windows.Media.Pen]::new($teal, 18)
  $fPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round
  $fPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
  $context.DrawLine($fPen, [System.Windows.Point]::new(119, 75), [System.Windows.Point]::new(193, 75))
  $context.DrawLine($fPen, [System.Windows.Point]::new(119, 75), [System.Windows.Point]::new(119, 181))
  $context.DrawLine($fPen, [System.Windows.Point]::new(119, 124), [System.Windows.Point]::new(176, 124))
  $context.DrawEllipse($brass, $null, [System.Windows.Point]::new(193, 75), 8, 8)

  $context.Pop()
  $context.Close()

  $bitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($Size, $Size, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  $encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
  try { $encoder.Save($stream) } finally { $stream.Dispose() }
}

[System.IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null
Write-PrecisionIcon -Size 512 -OutputPath (Join-Path $OutputDirectory 'icon-512x512.png')
Write-PrecisionIcon -Size 192 -OutputPath (Join-Path $OutputDirectory 'icon-192x192.png')
Write-PrecisionIcon -Size 180 -OutputPath (Join-Path $OutputDirectory 'apple-touch-icon.png')
