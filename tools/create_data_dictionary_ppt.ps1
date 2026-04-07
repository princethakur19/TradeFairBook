$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$outputPath = Join-Path $projectRoot "DataDictionary_TradeFairBook.pptx"

function New-DictionaryRow {
  param(
    [string]$srNo,
    [string]$columnName,
    [string]$dataType,
    [string]$size,
    [string]$constrain,
    [string]$description
  )

  return @($srNo, $columnName, $dataType, $size, $constrain, $description)
}

function Add-TitleSlide {
  param(
    $presentation,
    [string]$title,
    [string]$subtitle
  )

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)

  $titleShape = $slide.Shapes.AddTextbox(1, 40, 120, 640, 80)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 30
  $titleShape.TextFrame.TextRange.Font.Bold = -1
  $titleShape.TextFrame.TextRange.ParagraphFormat.Alignment = 2

  $subtitleShape = $slide.Shapes.AddTextbox(1, 40, 220, 640, 80)
  $subtitleShape.TextFrame.TextRange.Text = $subtitle
  $subtitleShape.TextFrame.TextRange.Font.Size = 18
  $subtitleShape.TextFrame.TextRange.ParagraphFormat.Alignment = 2

  return $slide
}

function Add-DataDictionaryTableSlide {
  param(
    $presentation,
    [string]$title,
    [object[]]$rows
  )

  $headers = @("SR.No", "Column Name", "Data type", "Size", "Constrain", "Description")
  $rowCount = $rows.Count + 1
  $colCount = $headers.Count

  $slide = $presentation.Slides.Add($presentation.Slides.Count + 1, 12)

  $titleShape = $slide.Shapes.AddTextbox(1, 20, 15, 680, 35)
  $titleShape.TextFrame.TextRange.Text = $title
  $titleShape.TextFrame.TextRange.Font.Size = 22
  $titleShape.TextFrame.TextRange.Font.Bold = -1

  $tableShape = $slide.Shapes.AddTable($rowCount, $colCount, 20, 58, 680, 455)
  $table = $tableShape.Table

  $table.Columns.Item(1).Width = 48
  $table.Columns.Item(2).Width = 105
  $table.Columns.Item(3).Width = 85
  $table.Columns.Item(4).Width = 78
  $table.Columns.Item(5).Width = 145
  $table.Columns.Item(6).Width = 219

  for ($col = 1; $col -le $colCount; $col++) {
    $headerCell = $table.Cell(1, $col)
    $headerCell.Shape.TextFrame.TextRange.Text = $headers[$col - 1]
    $headerCell.Shape.TextFrame.TextRange.Font.Bold = -1
    $headerCell.Shape.TextFrame.TextRange.Font.Size = 11
    $headerCell.Shape.TextFrame.TextRange.ParagraphFormat.Alignment = 2
    $headerCell.Shape.Fill.Visible = -1
    $headerCell.Shape.Fill.ForeColor.RGB = 14671839
  }

  $fontSize = if ($rows.Count -gt 10) { 8 } else { 9 }

  for ($rowIndex = 0; $rowIndex -lt $rows.Count; $rowIndex++) {
    $powerPointRow = $rowIndex + 2
    $row = $rows[$rowIndex]

    for ($colIndex = 0; $colIndex -lt $colCount; $colIndex++) {
      $cell = $table.Cell($powerPointRow, $colIndex + 1)
      $cell.Shape.TextFrame.TextRange.Text = [string]$row[$colIndex]
      $cell.Shape.TextFrame.TextRange.Font.Size = $fontSize
      $cell.Shape.TextFrame.WordWrap = -1
      $cell.Shape.TextFrame.AutoSize = 0
      $cell.Shape.TextFrame.VerticalAnchor = 1
    }
  }

  return $slide
}

function Add-CollectionSlides {
  param(
    $presentation,
    [string]$collectionName,
    [object[]]$rows,
    [int]$rowsPerSlide = 12
  )

  $totalRows = $rows.Count
  $start = 0
  $part = 1
  $slides = @()
  $totalParts = [Math]::Ceiling($totalRows / $rowsPerSlide)

  while ($start -lt $totalRows) {
    $chunk = $rows | Select-Object -Skip $start -First $rowsPerSlide
    $partTitle = if ($totalParts -gt 1) {
      "Data Dictionary - $collectionName (Part $part/$totalParts)"
    }
    else {
      "Data Dictionary - $collectionName"
    }

    $slides += Add-DataDictionaryTableSlide -presentation $presentation -title $partTitle -rows $chunk
    $start += $rowsPerSlide
    $part += 1
  }

  return $slides
}

function Set-SlideTheme {
  param($slide)
  $bg = $slide.Background.Fill
  $bg.Visible = -1
  $bg.ForeColor.RGB = 16777215
}

$dictionary = [ordered]@{
  "Users Collection (users)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique user identifier"),
    (New-DictionaryRow "2" "fullname" "String" "Variable" "Required" "User full name"),
    (New-DictionaryRow "3" "company" "String" "Variable" "Required" "Company or organization name"),
    (New-DictionaryRow "4" "email" "String" "Variable" "Required, Unique" "User login email"),
    (New-DictionaryRow "5" "phone" "String" "Variable" "Required" "User phone number"),
    (New-DictionaryRow "6" "password" "String" "About 60 chars" "Required" "Bcrypt password hash"),
    (New-DictionaryRow "7" "role" "String" "Up to 11 chars" "Enum: USER,ADMIN,SUPER_ADMIN; Default USER" "Access control role"),
    (New-DictionaryRow "8" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "9" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "Domes Collection (domes)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique dome identifier"),
    (New-DictionaryRow "2" "domeName" "String" "Variable" "Required" "Dome name"),
    (New-DictionaryRow "3" "location" "String" "Variable" "Required" "Dome location"),
    (New-DictionaryRow "4" "description" "String" "Variable" "Optional" "Dome description"),
    (New-DictionaryRow "5" "image" "String" "Variable" "Optional" "Dome image URL or path"),
    (New-DictionaryRow "6" "status" "String" "Up to 8 chars" "Enum: ACTIVE,INACTIVE; Default ACTIVE" "Dome status"),
    (New-DictionaryRow "7" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "8" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "Stalls Collection (stalls)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique stall identifier"),
    (New-DictionaryRow "2" "stallNumber" "String" "Variable" "Required, Trim, Unique with dome" "Stall number or code"),
    (New-DictionaryRow "3" "dome" "ObjectId" "24 hex chars" "Required, FK -> domes._id" "Dome reference"),
    (New-DictionaryRow "4" "side" "String" "Up to 6 chars" "Required, Enum: LEFT,RIGHT,TOP,BOTTOM,CENTER" "Stall side in layout"),
    (New-DictionaryRow "5" "price" "Number" "8 bytes" "Required, Min 0" "Stall price"),
    (New-DictionaryRow "6" "status" "String" "Up to 9 chars" "Enum: AVAILABLE,BOOKED,HOLD,BLOCKED; Default AVAILABLE" "Availability status"),
    (New-DictionaryRow "7" "centerSpacing" "String" "Up to 10 chars" "Enum: with-space,no-space; Default with-space" "Center layout spacing flag"),
    (New-DictionaryRow "8" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "9" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "Materials Collection (materials)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique material identifier"),
    (New-DictionaryRow "2" "dome" "ObjectId" "24 hex chars" "Required, FK -> domes._id" "Dome reference"),
    (New-DictionaryRow "3" "name" "String" "Variable" "Required, Trim, Unique with dome" "Material name"),
    (New-DictionaryRow "4" "price" "Number" "8 bytes" "Required, Min 0" "Material price"),
    (New-DictionaryRow "5" "description" "String" "Variable" "Default empty, Trim" "Material description"),
    (New-DictionaryRow "6" "isActive" "Boolean" "1 byte" "Default true" "Material active flag"),
    (New-DictionaryRow "7" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "8" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "AadhaarVerification Collection (aadhaarverifications)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique verification identifier"),
    (New-DictionaryRow "2" "user" "ObjectId" "24 hex chars" "Required, FK -> users._id" "User reference"),
    (New-DictionaryRow "3" "aadhaarName" "String" "Variable" "Required, Trim" "Name as on Aadhaar"),
    (New-DictionaryRow "4" "aadhaarNumber" "String" "Encrypted variable text" "Required, select:false, API expects 12 digits" "Encrypted Aadhaar number"),
    (New-DictionaryRow "5" "aadhaarImage" "String" "Variable" "Required, Trim" "Uploaded image path"),
    (New-DictionaryRow "6" "verified" "Boolean" "1 byte" "Default false" "Verification status"),
    (New-DictionaryRow "7" "submittedAt" "Date" "8 bytes" "Default Date.now" "Submission timestamp"),
    (New-DictionaryRow "8" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "9" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "Bookings Collection (bookings)" = @(
    (New-DictionaryRow "1" "_id" "ObjectId" "24 hex chars" "PK, Auto-generated" "Unique booking identifier"),
    (New-DictionaryRow "2" "user" "ObjectId" "24 hex chars" "FK -> users._id" "User reference"),
    (New-DictionaryRow "3" "stall" "ObjectId" "24 hex chars" "FK -> stalls._id" "Stall reference"),
    (New-DictionaryRow "4" "dome" "ObjectId" "24 hex chars" "FK -> domes._id" "Dome reference"),
    (New-DictionaryRow "5" "stallPrice" "Number" "8 bytes" "Default 0" "Base stall price"),
    (New-DictionaryRow "6" "amount" "Number" "8 bytes" "Optional" "Booking amount"),
    (New-DictionaryRow "7" "defaultMaterials" "Array<Object>" "Variable" "Default []" "Included material snapshot"),
    (New-DictionaryRow "8" "extraMaterials" "Array<Object>" "Variable" "Default []" "Extra material snapshot"),
    (New-DictionaryRow "9" "extraMaterialTotal" "Number" "8 bytes" "Default 0" "Total extra material cost"),
    (New-DictionaryRow "10" "extraMaterialShare" "Number" "8 bytes" "Default 0" "Per booking distributed share"),
    (New-DictionaryRow "11" "grandTotal" "Number" "8 bytes" "Default 0" "Final total amount"),
    (New-DictionaryRow "12" "aadhaarVerification" "ObjectId" "24 hex chars" "Required, FK -> aadhaarverifications._id" "Aadhaar verification reference"),
    (New-DictionaryRow "13" "status" "String" "Up to 9 chars" "Enum: PENDING,APPROVED,PAID,REJECTED,CANCELLED; Default PENDING" "Booking lifecycle status"),
    (New-DictionaryRow "14" "paymentOrderId" "String" "Variable" "Trim, Default empty" "Razorpay order ID"),
    (New-DictionaryRow "15" "paymentId" "String" "Variable" "Trim, Default empty" "Razorpay payment ID"),
    (New-DictionaryRow "16" "paymentSignature" "String" "Variable" "Trim, Default empty" "Payment signature"),
    (New-DictionaryRow "17" "paidAt" "Date" "8 bytes" "Default null" "Payment timestamp"),
    (New-DictionaryRow "18" "createdAt" "Date" "8 bytes" "Auto (timestamps)" "Record creation time"),
    (New-DictionaryRow "19" "updatedAt" "Date" "8 bytes" "Auto (timestamps)" "Record last update time")
  )

  "Embedded Booking Material Structure" = @(
    (New-DictionaryRow "1" "materialId" "ObjectId" "24 hex chars" "FK -> materials._id, Default null" "Material reference"),
    (New-DictionaryRow "2" "name" "String" "Variable" "Required, Trim" "Material name"),
    (New-DictionaryRow "3" "price" "Number" "8 bytes" "Default 0, Min 0" "Unit price"),
    (New-DictionaryRow "4" "quantity" "Number" "8 bytes" "Required, Min 1" "Selected quantity"),
    (New-DictionaryRow "5" "subtotal" "Number" "8 bytes" "Default 0, Min 0" "price x quantity")
  )
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
    -title "Trade Fair Stall Booking System" `
    -subtitle "Data Dictionary`r`nGenerated on 03-04-2026"

  foreach ($entry in $dictionary.GetEnumerator()) {
    $slides += Add-CollectionSlides `
      -presentation $presentation `
      -collectionName $entry.Key `
      -rows $entry.Value `
      -rowsPerSlide 12
  }

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
