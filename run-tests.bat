@echo off
echo ========================================
echo    TESTE COMPLETO DO SISTEMA
echo ========================================
echo.

echo 1. Verificando configurações...
node test-config.js
echo.

echo ========================================
echo PRÓXIMOS PASSOS:
echo ========================================
echo.
echo 2. Configure o sistema:
echo    - Acesse: http://localhost:3001/app/settings
echo    - Ative envio automático
echo    - Configure Mailtrap
echo.
echo 3. Crie um convite de teste:
echo    - Edite create-test-invite.js (coloque seu email)
echo    - Execute: node create-test-invite.js
echo.
echo 4. Processe emails:
echo    - Aguarde 1 minuto
echo    - Execute: node cron-emails.js
echo.
echo 5. Verifique status:
echo    - Execute: node check-status.js
echo.
echo 6. Teste webhook (opcional):
echo    - Execute: node test-webhook.js
echo.
echo 7. Teste lembretes (opcional):
echo    - Execute: node simulate-time.js
echo    - Execute: node cron-emails.js
echo.
pause
