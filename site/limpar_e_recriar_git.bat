@echo off
echo ========================================
echo  LIMPAR E RECRIAR REPOSITORIO GIT
echo ========================================
echo.
echo ATENCAO: Isso vai limpar todo o historico Git!
echo.
pause

echo.
echo Removendo pasta .git...
if exist .git rmdir /s /q .git

echo.
echo Inicializando novo repositorio Git...
git init

echo.
echo Adicionando arquivos essenciais...
git add .gitignore
git add index.html
git add script.js
git add styles.css
git add vercel.json
git add CRIAR_TABELAS_SUPABASE.sql

echo.
echo Fazendo primeiro commit...
git commit -m "Repositorio limpo - apenas arquivos essenciais"

echo.
echo Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/Weslleyleno/chinasonfire1.git

echo.
echo ========================================
echo  IMPORTANTE: Proximo passo requer forcar push
echo ========================================
echo.
echo Fazendo push forçado para GitHub...
git branch -M main
git push -f origin main

echo.
echo ========================================
echo  REPOSITORIO LIMPO E RECRIADO!
echo ========================================
echo.
echo O Vercel deve atualizar automaticamente
echo em aproximadamente 1-2 minutos.
echo.
pause
