@echo off
echo ========================================
echo   ATUALIZANDO SITE - CHINAS ON FIRE
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando Git...
git status >nul 2>&1
if errorlevel 1 (
    echo Git nao inicializado. Inicializando...
    git init
    echo.
    echo ⚠️  ATENCAO: Configure o remote do GitHub primeiro!
    echo    git remote add origin https://github.com/SEU-USUARIO/chinas-on-fire.git
    echo.
    pause
    exit /b
)

echo.
echo Adicionando arquivos modificados...
git add .

echo.
echo Fazendo commit...
set "MESSAGE=Atualização automática - %date% %time%"
git commit -m "%MESSAGE%"

echo.
echo Enviando para GitHub...
git push

echo.
echo ========================================
echo   ✅ ATUALIZACAO CONCLUIDA!
echo ========================================
echo.
echo O Vercel/Netlify vai atualizar automaticamente
echo em aproximadamente 1-2 minutos.
echo.
pause
