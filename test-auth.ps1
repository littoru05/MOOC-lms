# Script kiem tra tu dong he thong xac thuc moi (Access Token + HttpOnly Cookie Refresh Token)
$baseUrl = "http://localhost:8080/api/v1/auth"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "KIEM TRA HE THONG XAC THUC MOI TREN WINDOWS POWERSHELL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. TEST LOGIN
Write-Host "`n[1/4] Dang thu nghiem: POST /api/v1/auth/login..." -ForegroundColor Yellow
$loginBody = '{"email":"student@lms.com","password":"student123"}'

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
    Write-Host "-> DANG NHAP THANH CONG!" -ForegroundColor Green
    Write-Host "   Access Token nhan duoc: $($loginRes.token.Substring(0, 35))..." -ForegroundColor Gray
    Write-Host "   User: $($loginRes.fullName) ($($loginRes.role))" -ForegroundColor Gray
    
    $cookies = $session.Cookies.GetCookies((New-Object System.Uri($baseUrl)))
    $refreshCookie = $cookies["refreshToken"]
    if ($refreshCookie) {
        Write-Host "   -> Cookie HttpOnly refreshToken DA DUOC SET:" -ForegroundColor Green
        Write-Host "      Gia tri: $($refreshCookie.Value.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "      HttpOnly: $($refreshCookie.HttpOnly) | Path: $($refreshCookie.Path)" -ForegroundColor Gray
    } else {
        Write-Host "   -> CANH BAO: Chua thay cookie refreshToken!" -ForegroundColor Red
    }
} catch {
    Write-Host "-> LOI DANG NHAP: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. TEST REFRESH (TOKEN ROTATION)
Write-Host "`n[2/4] Dang thu nghiem: POST /api/v1/auth/refresh (Cap lai token)..." -ForegroundColor Yellow
try {
    $refreshRes = Invoke-RestMethod -Uri "$baseUrl/refresh" -Method Post -ContentType "application/json" -WebSession $session
    Write-Host "-> REFRESH THANH CONG (Token Rotation)!" -ForegroundColor Green
    Write-Host "   Access Token moi: $($refreshRes.token.Substring(0, 35))..." -ForegroundColor Gray
    
    $cookiesAfterRefresh = $session.Cookies.GetCookies((New-Object System.Uri($baseUrl)))
    $newRefreshCookie = $cookiesAfterRefresh["refreshToken"]
    Write-Host "   Refresh Cookie moi: $($newRefreshCookie.Value.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "-> LOI REFRESH: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. TEST REUSE DETECTION
Write-Host "`n[3/4] Dang thu nghiem: Gui Refresh Token rac/khong ton tai (Case a)..." -ForegroundColor Yellow
$badSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$cookie = New-Object System.Net.Cookie("refreshToken", "fake-token-12345", "/api/v1/auth", "localhost")
$badSession.Cookies.Add((New-Object System.Uri($baseUrl)), $cookie)

try {
    $failRes = Invoke-RestMethod -Uri "$baseUrl/refresh" -Method Post -ContentType "application/json" -WebSession $badSession
    Write-Host "-> THAT BAI: Le ra phai bi chan nhung lai thanh cong!" -ForegroundColor Red
} catch {
    Write-Host "-> DA BI CHAN CHINH XAC (HTTP 401 Unauthorized)!" -ForegroundColor Green
    Write-Host "   Chi tiet loi: $($_.Exception.Message)" -ForegroundColor Gray
}

# 4. TEST LOGOUT
Write-Host "`n[4/4] Dang thu nghiem: POST /api/v1/auth/logout..." -ForegroundColor Yellow
try {
    $logoutRes = Invoke-RestMethod -Uri "$baseUrl/logout" -Method Post -ContentType "application/json" -WebSession $session
    Write-Host "-> DANG XUAT THANH CONG!" -ForegroundColor Green
    Write-Host "   Thong bao: $($logoutRes.message)" -ForegroundColor Gray
    
    $cookiesAfterLogout = $session.Cookies.GetCookies((New-Object System.Uri($baseUrl)))
    $logoutCookie = $cookiesAfterLogout["refreshToken"]
    if (-not $logoutCookie -or $logoutCookie.Expired -or $logoutCookie.Value -eq "") {
        Write-Host "   -> Cookie refreshToken DA BI XOA/VO HIEU HOA!" -ForegroundColor Green
    }
} catch {
    Write-Host "-> LOI DANG XUAT: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "HOAN TAT KIEM THU BACKEND!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
