# 20260105-wgeasy

## Deploy automatizado para Hostinger

- **Workflow**: `.github/workflows/deploy-hostinger-workflow.yml` roda em pushes para `main` (ou manualmente) e executa: checkout → instalação root/backend/frontend → `npm --prefix backend run build` → `npm --prefix frontend run deploy:hostinger`.
- **Pipeline seguro**: o script `npm --prefix frontend run deploy:hostinger` faz `npm run build`, valida o FTP (`frontend/validate-hostinger-ftp.js`) e, então, chama `frontend/deploy-hostinger.js`, garantindo que o build é recente e o FTP está acessível.
- **Segredos obrigatórios**:
  * `HOSTINGER_FTP_HOST`, `HOSTINGER_FTP_USER`, `HOSTINGER_FTP_PASS`, `HOSTINGER_FTP_PATH`
  * `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON), `GOOGLE_SERVICE_ACCOUNT_SUBJECT` (opcional)
  * `GOOGLE_CALENDAR_REFRESH_TOKEN`, `GOOGLE_KEEP_SCRIPT_URL`
  * `DIARIO_OBRA_BUCKET`, `DIARIO_FOTO_MAX_BYTES` (opcionais, padrão `diario-obra`/`12MB`)
- **Notas**: a Service Account JSON não está no repositório (apaguei `wg-easy-sistema-818e902fc976.json`); coloque o conteúdo dentro de `GOOGLE_SERVICE_ACCOUNT_KEY` no GitHub Actions e nunca o commit. Use o mesmo token/refresh no backend e no Keep para manter os refreshes indefinidamente.
