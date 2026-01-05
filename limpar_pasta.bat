@echo off
echo ========================================
echo   LIMPEZA DE ARQUIVOS DESNECESSARIOS
echo ========================================
echo.
echo Este script vai manter apenas os arquivos essenciais:
echo   - index.html
echo   - script.js
echo   - styles.css
echo   - iniciar.bat
echo   - README.md
echo.
echo Todos os outros arquivos .md serao removidos!
echo.
pause

echo.
echo Removendo arquivos de documentacao...
echo.

del /Q ATUALIZACOES.md 2>nul
del /Q COMANDOS_FINAIS.md 2>nul
del /Q COMANDOS_PRONTO.md 2>nul
del /Q COMO_ATUALIZAR_SITE.md 2>nul
del /Q COMO_CRIAR_TABELAS_FACIL.md 2>nul
del /Q COMO_ENCONTRAR_CREDENCIAIS_SUPABASE.md 2>nul
del /Q COMO_TESTAR_LOCAL.md 2>nul
del /Q DADOS_SINCRONIZADOS.md 2>nul
del /Q DEPLOY_COMPLETO.md 2>nul
del /Q DEPLOY.md 2>nul
del /Q GUIA_FACIL_DEPLOY.md 2>nul
del /Q MIGRACAO_DADOS.md 2>nul
del /Q PASSO_A_PASSO_AGORA.md 2>nul
del /Q PASSO_A_PASSO_ATUALIZAR.md 2>nul
del /Q RESUMO_FINAL.md 2>nul
del /Q REVISAO_CODIGO.md 2>nul
del /Q SETUP_FIREBASE.md 2>nul
del /Q SETUP_SUPABASE.md 2>nul
del /Q SINCRONIZACAO_SUPABASE.md 2>nul
del /Q TESTE_SINCRONIZACAO.md 2>nul

echo.
echo ✅ Limpeza concluida!
echo.
echo Arquivos mantidos:
dir /B *.html *.js *.css *.bat *.md 2>nul
echo.
pause
