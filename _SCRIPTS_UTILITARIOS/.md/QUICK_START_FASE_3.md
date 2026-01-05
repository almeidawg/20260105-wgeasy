# 🚀 QUICK REFERENCE - PRÓXIMOS PASSOS

## Fase 3: Performance Optimization (30 min)

```powershell
cd site

# 1. Otimizar imagens para WebP
pwsh .\optimize-images.ps1

# 2. Verificar componentes com LazyImage
# Editar em: src/utils/ImageOptimization.jsx

# 3. Testar com Lighthouse
npm run build
npm run preview
# Abrir em browser e rodar Lighthouse
```

## Fase 4: Deploy (1h)

```powershell
# 1. Configurar Git remote (se não tiver)
git remote add origin https://seu-repo.git

# 2. Push para remote
git push origin main

# 3. Setup GitHub Actions (opcional)
# Criar: .github/workflows/ci.yml
```

## Fase 5: Final Validation (30 min)

```powershell
# 1. Test coverage report
npm run test:coverage

# 2. Full build
npm run build

# 3. Final lint
npm run lint

# 4. Audit final
npm audit
```

---

## 📊 Status Atual

| Item      | Status | Score      |
| --------- | ------ | ---------- |
| Build     | ✅     | 10/10      |
| Lint      | ✅     | 10/10      |
| Tests     | ✅     | 12/12      |
| Audit     | ✅     | 0 vulns    |
| **Total** | **✅** | **9.1/10** |

---

## 🔧 Comandos Úteis

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run preview          # Preview build
npm run lint             # Lint code
npm run test             # Watch tests
npm run test:ui          # Test UI
npm run test:coverage    # Coverage report
npm run test:run         # Single run
npm audit                # Check deps
npm audit fix            # Fix vulnerabilities
```

---

## 📁 Arquivos Importantes

```
site/
├── vite.config.js              (config melhorado)
├── vitest.config.js            (vitest setup)
├── vitest.setup.js             (testing library)
├── .eslintignore               (eslint config)
├── src/__tests__/              (testes)
│   ├── example.test.jsx        (12 testes exemplo)
│   └── __snapshots__/
├── src/utils/                  (utilities)
│   └── ImageOptimization.jsx   (lazy load, responsive)
├── setup-tests.ps1             (automation)
└── optimize-images.ps1         (automation)
```

---

## ⚡ Quick Tips

1. **Build com erro de arquivo travado?**

   - Fechar editors/terminals
   - Fazer: `npm run build` novamente
   - Ou: `taskkill /IM node.exe /F`

2. **Testes falhando?**

   - Rodar: `npm run test:ui` (debug visual)
   - Checar: `npm audit` (dependencies)
   - Reset: `rm -r node_modules && npm install`

3. **Git push com erro de remote?**

   - `git remote add origin <url>`
   - `git push -u origin main`

4. **Lighthouse score baixo?**
   - Rodar: `npm run preview`
   - Usar: LazyImage nos componentes
   - Otimizar: Imagens WebP

---

## 📞 Support

- Documentação: `RESUMO_IMPLEMENTACAO_FASE_1_2.md`
- Audit: `AUDITORIA_SITE_WG_ALMEIDA.md`
- Guia: `GUIA_IMPLEMENTACAO_MELHORIAS.md`

---

**Last Updated:** 01 de Janeiro de 2026
**Status:** ✅ Ready for Phase 3
**Next:** Performance Optimization
