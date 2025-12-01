# ==========================================
# Blue-Green Deployment Switch Script (Windows)
# ==========================================
# Este script permite cambiar el tráfico entre
# los entornos BLUE y GREEN sin downtime
# ==========================================

$CONFIG_FILE = ".\nginx\conf.d\default.conf"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Blue-Green Deployment Switch" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar estado actual
Write-Host "Estado actual:" -ForegroundColor Yellow
Write-Host ""

# Health check de ambos entornos
Write-Host "   BLUE:  " -NoNewline -ForegroundColor Blue
try {
    $blueResponse = Invoke-RestMethod -Uri "http://localhost/blue-health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Healthy" -ForegroundColor Green
} catch {
    Write-Host "No disponible" -ForegroundColor Red
}

Write-Host "   GREEN: " -NoNewline -ForegroundColor Green
try {
    $greenResponse = Invoke-RestMethod -Uri "http://localhost/green-health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Healthy" -ForegroundColor Green
} catch {
    Write-Host "No disponible" -ForegroundColor Red
}

Write-Host ""
Write-Host "   Activo: " -NoNewline -ForegroundColor Yellow
try {
    $activeResponse = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    $activeVersion = $activeResponse.version
    if ($activeVersion -eq "BLUE") {
        Write-Host "BLUE" -ForegroundColor Blue
    } elseif ($activeVersion -eq "GREEN") {
        Write-Host "GREEN" -ForegroundColor Green
    } else {
        Write-Host $activeVersion -ForegroundColor Gray
    }
} catch {
    Write-Host "Error al obtener estado" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Menu de opciones
Write-Host "Seleccione una opcion:" -ForegroundColor White
Write-Host ""
Write-Host "  1) Cambiar a BLUE" -ForegroundColor Blue
Write-Host "  2) Cambiar a GREEN" -ForegroundColor Green
Write-Host "  3) Solo verificar estado" -ForegroundColor Yellow
Write-Host "  4) Salir" -ForegroundColor Gray
Write-Host ""

$option = Read-Host "Opcion"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "Cambiando trafico a BLUE..." -ForegroundColor Blue
        
        # Leer archivo y reemplazar
        $content = Get-Content $CONFIG_FILE -Raw
        $content = $content -replace "server api-green:3000;  # <-- CAMBIAR", "server api-blue:3000;  # <-- CAMBIAR"
        Set-Content $CONFIG_FILE $content -NoNewline
        
        # Reload Nginx
        docker exec nginx-proxy nginx -s reload
        
        Write-Host "Trafico redirigido a BLUE" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "Cambiando trafico a GREEN..." -ForegroundColor Green
        
        # Leer archivo y reemplazar
        $content = Get-Content $CONFIG_FILE -Raw
        $content = $content -replace "server api-blue:3000;  # <-- CAMBIAR", "server api-green:3000;  # <-- CAMBIAR"
        Set-Content $CONFIG_FILE $content -NoNewline
        
        # Reload Nginx
        docker exec nginx-proxy nginx -s reload
        
        Write-Host "Trafico redirigido a GREEN" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "Estado verificado arriba." -ForegroundColor Yellow
    }
    "4" {
        Write-Host ""
        Write-Host "Saliendo..." -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "Opcion no valida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 1
Write-Host "Entorno activo ahora: " -NoNewline -ForegroundColor Yellow
try {
    $newActive = Invoke-RestMethod -Uri "http://localhost/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($newActive.version -eq "BLUE") {
        Write-Host "BLUE" -ForegroundColor Blue
    } elseif ($newActive.version -eq "GREEN") {
        Write-Host "GREEN" -ForegroundColor Green
    }
} catch {
    Write-Host "Error" -ForegroundColor Red
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
