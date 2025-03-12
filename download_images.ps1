# 添加必要的.NET类型
Add-Type -AssemblyName System.Web

# 清理文件名的函数
function Clean-FileName {
    param([string]$fileName)
    # 移除或替换不合法的字符
    $cleanName = $fileName -replace '[\\/:*?"<>|]', ''
    return $cleanName.Trim()
}

# 下载函数，包含重试机制
function Download-WithRetry {
    param(
        [string]$url,
        [string]$outputPath,
        [int]$maxRetries = 3,
        [int]$retryDelaySeconds = 5
    )
    
    # 检查文件是否已存在且大小大于0
    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length
        if ($fileSize -gt 0) {
            Write-Host "File already exists: $([System.IO.Path]::GetFileName($outputPath)) (Size: $fileSize bytes)" -ForegroundColor Cyan
            return $true
        }
    }
    
    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            $ProgressPreference = 'SilentlyContinue'
            Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
            if (Test-Path $outputPath) {
                $fileSize = (Get-Item $outputPath).Length
                Write-Host "Successfully downloaded: $([System.IO.Path]::GetFileName($outputPath)) (Size: $fileSize bytes)" -ForegroundColor Green
                return $true
            }
        } catch {
            if ($i -lt $maxRetries) {
                Write-Host "Attempt $i failed. Retrying in $retryDelaySeconds seconds..." -ForegroundColor Yellow
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
                Start-Sleep -Seconds $retryDelaySeconds
            } else {
                Write-Host "Failed to download after $maxRetries attempts: $([System.IO.Path]::GetFileName($outputPath))" -ForegroundColor Red
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        }
    }
    return $false
}

# Set output directory
$outputDir = "public/images/dishes"

# 确保输出目录存在
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "Creating directory: $outputDir"
}

# Read markdown file and extract URLs and filenames
Write-Host "Reading dishes_images.md file..."
$content = Get-Content -Path "dishes_images.md" -Raw

# 使用更精确的正则表达式
$pattern = '!\[image\]\((https://image\.pollinations\.ai/[^)]+)\)[^-]*- 本地文件名:\s*([^\r\n]+)'
$matches = [regex]::Matches($content, $pattern)
$totalImages = $matches.Count
Write-Host "Found $totalImages images to download"

$index = 1
$successCount = 0
$skippedCount = 0
foreach ($match in $matches) {
    $url = $match.Groups[1].Value
    $filename = Clean-FileName($match.Groups[2].Value.Trim())
    $outputPath = Join-Path $outputDir $filename
    
    Write-Host "`n[$index/$totalImages] Processing: $filename"
    Write-Host "URL: $url"
    
    # 检查文件是否已存在
    if (Test-Path $outputPath) {
        $fileSize = (Get-Item $outputPath).Length
        if ($fileSize -gt 0) {
            Write-Host "Skipping existing file: $filename (Size: $fileSize bytes)" -ForegroundColor Cyan
            $skippedCount++
            $successCount++
        } else {
            if (Download-WithRetry -url $url -outputPath $outputPath) {
                $successCount++
            }
                
    # Add longer delay between downloads
    Start-Sleep -Seconds 2
        }
    } else {
        if (Download-WithRetry -url $url -outputPath $outputPath) {
            $successCount++
        } 
    # Add longer delay between downloads
    Start-Sleep -Seconds 2
    }
    $index++
}

Write-Host "`nDownload completed!"
Write-Host "Successfully downloaded: $($successCount - $skippedCount)/$totalImages new images"
Write-Host "Skipped existing files: $skippedCount"
Write-Host "Total success: $successCount/$totalImages images"
Write-Host "Images saved in: $((Get-Item $outputDir).FullName)" 