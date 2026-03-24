$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outputPath = Join-Path $projectRoot "Review4_TradeFairBook.pptx"

function Add-BulletsSlide {
  param(
    $presentation,
    [string]$title,
    [string[]]$bullets
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  $titleShape = $slide.Shapes.AddTextbox(1, 40, 25, 620, 40)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 28
  $titleShape.TextFrame.TextRange.Font.Bold = -1

  $contentShape = $slide.Shapes.AddTextbox(1, 55, 105, 620, 360)
  $textRange = $contentShape.TextFrame.TextRange
  $textRange.Text = ($bullets -join "`r")

  for ($i = 1; $i -le $bullets.Count; $i++) {
    $paragraph = $textRange.Paragraphs($i)
    $paragraph.ParagraphFormat.Bullet.Visible = -1
    $paragraph.Font.Size = 24
  }

  return $slide
}

function Add-TitleSlide {
  param(
    $presentation,
    [string]$title,
    [string]$subtitle
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  $titleShape = $slide.Shapes.AddTextbox(1, 60, 120, 600, 120)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 30
  $titleShape.TextFrame.TextRange.Font.Bold = -1
  $titleShape.TextFrame.TextRange.ParagraphFormat.Alignment = 2

  $subtitleShape = $slide.Shapes.AddTextbox(1, 80, 255, 560, 140)
  $subtitleShape.TextFrame.TextRange.Text = $subtitle
  $subtitleShape.TextFrame.TextRange.Font.Size = 20
  $subtitleShape.TextFrame.TextRange.ParagraphFormat.Alignment = 2
  return $slide
}

function Add-TwoColumnSlide {
  param(
    $presentation,
    [string]$title,
    [string]$leftTitle,
    [string[]]$leftBullets,
    [string]$rightTitle,
    [string[]]$rightBullets
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  $titleShape = $slide.Shapes.AddTextbox(1, 40, 25, 620, 40)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 28
  $titleShape.TextFrame.TextRange.Font.Bold = -1

  $leftShape = $slide.Shapes.AddTextbox(1, 45, 100, 290, 330)
  $left = $leftShape.TextFrame.TextRange
  $left.Text = @($leftTitle) + $leftBullets -join "`r"
  $left.Paragraphs(1).Font.Bold = -1
  $left.Paragraphs(1).Font.Size = 22
  for ($i = 2; $i -le ($leftBullets.Count + 1); $i++) {
    $para = $left.Paragraphs($i)
    $para.ParagraphFormat.Bullet.Visible = -1
    $para.Font.Size = 20
  }

  $rightShape = $slide.Shapes.AddTextbox(1, 355, 100, 290, 330)
  $right = $rightShape.TextFrame.TextRange
  $right.Text = @($rightTitle) + $rightBullets -join "`r"
  $right.Paragraphs(1).Font.Bold = -1
  $right.Paragraphs(1).Font.Size = 22
  for ($i = 2; $i -le ($rightBullets.Count + 1); $i++) {
    $para = $right.Paragraphs($i)
    $para.ParagraphFormat.Bullet.Visible = -1
    $para.Font.Size = 20
  }

  return $slide
}

function Add-ScreenshotPlaceholderSlide {
  param(
    $presentation,
    [string]$title,
    [string[]]$labels
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
  $titleShape = $slide.Shapes.AddTextbox(1, 40, 25, 620, 40)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 28
  $titleShape.TextFrame.TextRange.Font.Bold = -1

  $positions = @(
    @{ Left = 40; Top = 120 },
    @{ Left = 370; Top = 120 },
    @{ Left = 40; Top = 340 },
    @{ Left = 370; Top = 340 }
  )

  for ($i = 0; $i -lt [Math]::Min($labels.Count, $positions.Count); $i++) {
    $pos = $positions[$i]
    $box = $slide.Shapes.AddShape(1, $pos.Left, $pos.Top, 280, 170)
    $box.Fill.ForeColor.RGB = 15132390
    $box.Line.ForeColor.RGB = 8421504
    $box.TextFrame.TextRange.Text = $labels[$i]
    $box.TextFrame.TextRange.Font.Size = 18
    $box.TextFrame.TextRange.ParagraphFormat.Alignment = 2
    $box.TextFrame.VerticalAnchor = 3
  }

  return $slide
}

function Set-SlideTheme {
  param($slide)

  $bg = $slide.Background.Fill
  $bg.Visible = -1
  $bg.ForeColor.RGB = 16777215
}

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Add()
  $presentation.PageSetup.SlideSize = 1

  $slides = @()
  $slides += Add-TitleSlide `
    -presentation $presentation `
    -title "TradeFairBook" `
    -subtitle "Review 4 Presentation`r`nFull System Demo, Testing, Reports and Final Screens`r`nDate: 28-03-2026"

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Project Overview" `
    -bullets @(
      "TradeFairBook is a web-based exhibition stall booking and management system.",
      "It allows exhibitors to view domes, select stalls, upload Aadhaar for verification and place bookings.",
      "It also provides an admin dashboard for dome setup, stall allocation, material management and reports."
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Problem Statement and Objectives" `
    -bullets @(
      "Manual stall booking is slow, error-prone and difficult to track in real time.",
      "The project aims to digitize stall selection, booking approval and report generation.",
      "Main goals are transparency, faster processing, data security and easy administration."
    )

  $slides += Add-TwoColumnSlide `
    -presentation $presentation `
    -title "Technology Stack and Architecture" `
    -leftTitle "Frontend" `
    -leftBullets @(
      "React 19 with Vite",
      "React Router for navigation",
      "Axios for API integration",
      "Responsive UI for user and admin modules"
    ) `
    -rightTitle "Backend" `
    -rightBullets @(
      "Node.js and Express",
      "MongoDB with Mongoose",
      "JWT authentication and role-based access",
      "Multer for Aadhaar image upload"
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Implemented User Modules" `
    -bullets @(
      "User registration and login with role validation.",
      "Browse domes and view available stalls with real-time status.",
      "Select one or multiple stalls, add extra materials and calculate booking total.",
      "Upload Aadhaar details and image before booking confirmation."
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Implemented Admin Modules" `
    -bullets @(
      "Admin dashboard with total users, bookings, pending approvals and revenue summary.",
      "Manage domes, create stall layouts and monitor stall availability.",
      "Manage optional materials per dome with price and active status.",
      "Approve, reject or cancel bookings and view dome-wise reports."
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Database and Core Entities" `
    -bullets @(
      "User: stores exhibitor and admin details with role-based access.",
      "Dome and Stall: maintain exhibition area, stall number, side, price and booking status.",
      "Booking: stores selected stall, user, amount, materials and approval status.",
      "AadhaarVerification and Material: support identity proof and optional booking resources."
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Testing and Validation" `
    -bullets @(
      "Tested registration, login, protected routes and JWT-based authorization.",
      "Validated multi-stall booking, duplicate stall prevention and single-dome booking rules.",
      "Verified Aadhaar form validation, image-only upload and file-size checks.",
      "Checked admin actions, report generation and booking status updates through Postman and UI testing."
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Reports and Outcomes" `
    -bullets @(
      "System generates dome-wise reports containing total stalls, booked stalls, available stalls and revenue.",
      "Admin dashboard displays booking statistics and revenue by dome for decision support.",
      "Project reduces manual errors and improves booking transparency and tracking."
    )

  $slides += Add-ScreenshotPlaceholderSlide `
    -presentation $presentation `
    -title "Final System Screens - User Module" `
    -labels @(
      "Insert Home / Dome Listing Screenshot",
      "Insert Stall Selection Screenshot",
      "Insert Booking Summary Screenshot",
      "Insert Aadhaar Upload Screenshot"
    )

  $slides += Add-ScreenshotPlaceholderSlide `
    -presentation $presentation `
    -title "Final System Screens - Admin Module" `
    -labels @(
      "Insert Admin Dashboard Screenshot",
      "Insert Manage Materials Screenshot",
      "Insert Booking Management Screenshot",
      "Insert Dome Report Screenshot"
    )

  $slides += Add-BulletsSlide `
    -presentation $presentation `
    -title "Conclusion and Future Scope" `
    -bullets @(
      "TradeFairBook successfully delivers an end-to-end digital stall booking solution.",
      "Review 4 confirms working demo, testing coverage, report generation and final UI completion.",
      "Future scope includes online payment gateway, email or SMS alerts and advanced analytics."
    )

  foreach ($slide in $slides) {
    Set-SlideTheme -slide $slide
  }

  if (Test-Path $outputPath) {
    Remove-Item $outputPath -Force
  }

  $presentation.SaveAs($outputPath)
  Write-Output "Created: $outputPath"
}
finally {
  if ($presentation) {
    $presentation.Close()
  }
  if ($powerPoint) {
    $powerPoint.Quit()
  }

  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}
