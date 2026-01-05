# Script para corrigir importações incorretas do supabaseClient

$files = @(
    "src\pages\financeiro\CobrancasPage.tsx",
    "src\pages\oportunidades\ArquiteturaOportunidadesKanbanPage.tsx",
    "src\pages\financeiro\CategoriasPage.tsx",
    "src\pages\financeiro\FinanceiroDashboardNew.tsx",
    "src\pages\financeiro\LancamentosPage.tsx",
    "src\lib\financeiroApi.ts",
    "src\pages\pessoas\PessoaDetalhePage.tsx",
    "src\utils\avatarUtils.ts",
    "src\auth\AuthContext.tsx",
    "src\pages\financeiro\FinanceiroKanbanPage.tsx",
    "src\lib\projectsApi.ts",
    "src\pages\cronograma\ProjectFormPage.tsx",
    "src\pages\marcenaria\MarcenariaPage.tsx",
    "src\pages\oportunidades\OportunidadesKanbanPage.tsx",
    "src\pages\PropostaEmissaoPage.tsx",
    "src\pages\marcenaria\MarcenariaKanbanPage.tsx",
    "src\pages\engenharia\EngenhariaKanbanPage.tsx",
    "src\pages\arquitetura\ArquiteturaKanbanPage.tsx",
    "src\pages\assistencia\AssistenciaKanbanPage.tsx",
    "src\lib\contratosApi.ts"
)

$count = 0
foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $newContent = $content -replace "import \{ supabase \} from (['`"]@/lib/supabaseClient['`"])", "import { supabaseRaw as supabase } from `$1"

        if ($content -ne $newContent) {
            Set-Content $fullPath $newContent -NoNewline
            Write-Host "✅ Fixed: $file"
            $count++
        } else {
            Write-Host "⏭️  Skipped (no change needed): $file"
        }
    } else {
        Write-Host "❌ Not found: $file"
    }
}

Write-Host "`n🎉 Total files fixed: $count"
