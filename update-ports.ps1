# Script para actualizar los puertos en archivos .env
Write-Host "=== Actualizando puertos en archivos .env ===" -ForegroundColor Green
Write-Host ""

# Función para actualizar archivo .env
function Update-EnvFile {
    param(
        [string]$FilePath,
        [hashtable]$Updates
    )
    
    if (Test-Path $FilePath) {
        Write-Host "Actualizando: $FilePath" -ForegroundColor Cyan
        $content = Get-Content $FilePath -Raw
        
        foreach ($key in $Updates.Keys) {
            $oldPattern = "$key=.*"
            $newValue = "$key=$($Updates[$key])"
            
            if ($content -match $oldPattern) {
                $content = $content -replace $oldPattern, $newValue
                Write-Host "  ✓ $key actualizado" -ForegroundColor Green
            } else {
                # Si no existe, agregarlo al final
                $content += "`n$newValue"
                Write-Host "  + $key agregado" -ForegroundColor Yellow
            }
        }
        
        $content | Set-Content $FilePath -NoNewline
        Write-Host ""
    } else {
        Write-Host "Creando: $FilePath" -ForegroundColor Yellow
        $lines = @()
        foreach ($key in $Updates.Keys) {
            $lines += "$key=$($Updates[$key])"
        }
        $lines -join "`n" | Set-Content $FilePath
        Write-Host "  ✓ Archivo creado" -ForegroundColor Green
        Write-Host ""
    }
}

# Actualizar apps/web/.env
$webEnvUpdates = @{
    "NEXTAUTH_URL" = '"http://localhost:3100"'
    "NEXT_PUBLIC_API_URL" = "http://localhost:3101/api/v1"
}
Update-EnvFile -FilePath "apps\web\.env" -Updates $webEnvUpdates

# Actualizar apps/backend/.env
$backendEnvUpdates = @{
    "PORT" = "3101"
    "CORS_ORIGINS" = "http://localhost:3100,http://localhost:3000,http://localhost:8081,exp://"
}
Update-EnvFile -FilePath "apps\backend\.env" -Updates $backendEnvUpdates

# Actualizar apps/desktop/.env si existe
if (Test-Path "apps\desktop\.env") {
    $desktopEnvUpdates = @{
        "VITE_API_URL" = "http://localhost:3101/api/v1"
    }
    Update-EnvFile -FilePath "apps\desktop\.env" -Updates $desktopEnvUpdates
}

Write-Host "=== Actualización completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Necesitas reiniciar los servicios para que los cambios tomen efecto:" -ForegroundColor Yellow
Write-Host "  1. Detén los servicios actuales (Ctrl+C en cada terminal)" -ForegroundColor White
Write-Host "  2. Reinicia el backend: cd apps/backend && npm run start:dev" -ForegroundColor White
Write-Host "  3. Reinicia el frontend: npm run dev --workspace=@ordo-todo/web" -ForegroundColor White
Write-Host ""
Write-Host "Nuevos puertos:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3100" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3101/api/v1" -ForegroundColor White
