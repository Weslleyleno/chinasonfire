@echo off
cd /d "C:\Users\AiNote\Desktop\site"
git add vercel.json
git commit -m "Adicionar vercel.json para corrigir deploy"
git push
echo.
echo ✅ Arquivo vercel.json enviado!
echo Aguarde o Vercel fazer o deploy automaticamente (~1-2 minutos)
pause
