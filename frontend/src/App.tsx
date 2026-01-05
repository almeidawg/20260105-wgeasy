import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "@/layout/MainLayout";
import ClienteLayout from "@/layout/ClienteLayout";
import LoginPage from "@/auth/LoginPage";
import SignupPage from "@/auth/SignupPage";
import ConfirmEmailPage from "@/auth/ConfirmEmailPage";
import ResetPasswordPage from "@/auth/ResetPasswordPage";
import ClienteProtectedRoute, {
  ClienteOnlyRoute,
} from "@/auth/ClienteProtectedRoute";
import PublicRoute from "@/auth/PublicRoute";
import { Loader2 } from "lucide-react";

/* ===================== LOADING COMPONENT ===================== */
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 text-[#F25C26] animate-spin" />
      <p className="text-sm text-gray-500">Carregando...</p>
    </div>
  </div>
);

/* ===================== LAZY IMPORTS - DASHBOARD ===================== */
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));

/* ===================== LAZY IMPORTS - PESSOAS ===================== */
const ClientesPage = lazy(() => import("@/pages/pessoas/ClientesPage"));
const ClienteFormPage = lazy(() => import("@/pages/pessoas/ClienteFormPage"));
const PessoaDetalhePage = lazy(
  () => import("@/pages/pessoas/PessoaDetalhePage")
);
const ColaboradoresPage = lazy(
  () => import("@/pages/pessoas/ColaboradoresPage")
);
const ColaboradorFormPage = lazy(
  () => import("@/pages/pessoas/ColaboradorFormPage")
);
const FornecedoresPage = lazy(() => import("@/pages/pessoas/FornecedoresPage"));
const FornecedorFormPage = lazy(
  () => import("@/pages/pessoas/FornecedorFormPage")
);
const EspecificadoresPage = lazy(
  () => import("@/pages/pessoas/EspecificadoresPage")
);
const EspecificadorFormPage = lazy(
  () => import("@/pages/pessoas/EspecificadorFormPage")
);
const ImportarPessoasPage = lazy(
  () => import("@/pages/pessoas/ImportarPessoasPage")
);
const ExportarImportarPessoasPage = lazy(
  () => import("@/pages/pessoas/ExportarImportarPessoasPage")
);

/* ===================== LAZY IMPORTS - OPORTUNIDADES ===================== */
const OportunidadesKanbanPage = lazy(
  () => import("@/pages/oportunidades/OportunidadesKanbanPage")
);
const OportunidadeFormPage = lazy(
  () => import("@/pages/oportunidades/OportunidadeFormPage")
);
const NucleoKanbanPage = lazy(
  () => import("@/pages/oportunidades/NucleoKanbanPage")
);

/* ===================== LAZY IMPORTS - ANÁLISE DE PROJETO ===================== */
const AnaliseProjetoListPage = lazy(
  () => import("@/pages/analise-projeto/AnaliseProjetoListPage")
);
const AnaliseProjetoEditorPage = lazy(
  () => import("@/pages/analise-projeto/AnaliseProjetoEditorPage")
);

/* ===================== LAZY IMPORTS - EVF (ESTUDO DE VIABILIDADE FINANCEIRA) ===================== */
const EVFPage = lazy(() => import("@/pages/evf/EVFPage"));
const EVFEditorPage = lazy(() => import("@/pages/evf/EVFEditorPage"));

/* ===================== LAZY IMPORTS - PROPOSTAS ===================== */
const PropostasPage = lazy(() => import("@/pages/propostas/PropostasPage"));
const PropostaEmissaoPage = lazy(() => import("@/pages/PropostaEmissaoPage"));
const PropostaEmissaoPageV2 = lazy(() =>
  import("@/modules/propostas-v2").then((m) => ({
    default: m.PropostaEmissaoPageV2,
  }))
);
const PropostaEmissaoPageV3 = lazy(() =>
  import("@/modules/propostas-v2").then((m) => ({
    default: m.PropostaEmissaoPageV3,
  }))
);
const ClientePropostasPage = lazy(
  () => import("@/pages/propostas/ClientePropostasPage")
);
const PropostaAcaoClientePage = lazy(
  () => import("@/pages/propostas/PropostaAcaoClientePage")
);

/* ===================== LAZY IMPORTS - CONTRATOS ===================== */
const ContratosPage = lazy(() => import("@/pages/contratos/ContratosPage"));
const ContratosKanbanPage = lazy(
  () => import("@/pages/contratos/ContratosKanbanPage")
);
const ContratoDetalhePage = lazy(
  () => import("@/pages/contratos/ContratoDetalhePage")
);
const ContratoFormPage = lazy(
  () => import("@/pages/contratos/ContratoFormPage")
);

/* ===================== LAZY IMPORTS - PRICELIST ===================== */
const PricelistPage = lazy(() => import("@/pages/pricelist/PricelistPage"));
const PricelistItemFormPage = lazy(
  () => import("@/pages/pricelist/PricelistItemFormPage")
);
const ImportarCatalogoIAPage = lazy(
  () => import("@/pages/pricelist/ImportarCatalogoIAPage")
);
const ImportarCatalogoExcelPage = lazy(
  () => import("@/pages/pricelist/ImportarCatalogoExcelPage")
);
const PricelistCategoriasPage = lazy(
  () => import("@/pages/pricelist/PricelistCategoriasPage")
);
const PricelistSubcategoriasPage = lazy(
  () => import("@/pages/pricelist/PricelistSubcategoriasPage")
);
const ExportarImportarPricelistPage = lazy(
  () => import("@/pages/pricelist/ExportarImportarPricelistPage")
);
const ImportarImagensPage = lazy(
  () => import("@/pages/pricelist/ImportarImagensPage")
);
const ImportarLotePage = lazy(
  () => import("@/pages/pricelist/ImportarLotePage")
);
const GerenciarCategoriasPage = lazy(
  () => import("@/pages/admin/GerenciarCategoriasPage")
);

/* ===================== LAZY IMPORTS - MEMORIAL DE ACABAMENTOS ===================== */
const MemorialAcabamentosPage = lazy(
  () => import("@/pages/MemorialAcabamentosPage")
);

/* ===================== LAZY IMPORTS - COMPRAS ===================== */
const ComprasPage = lazy(() => import("@/pages/compras/ComprasPage"));
const ComprasKanbanPage = lazy(
  () => import("@/pages/compras/ComprasKanbanPage")
);
const PedidoCompraFormPage = lazy(
  () => import("@/pages/compras/PedidoCompraFormPage")
);
const ComprasDetalhePage = lazy(
  () => import("@/pages/compras/ComprasDetalhePage")
);
const ImportarProdutoPage = lazy(
  () => import("@/pages/compras/ImportarProdutoPage")
);
const ListaComprasPage = lazy(() => import("@/pages/compras/ListaComprasPage"));
const ListaComprasV2Page = lazy(() =>
  import("@/modules/lista-compras").then((m) => ({
    default: m.ListaComprasPage,
  }))
);

/* ===================== LAZY IMPORTS - ASSISTÊNCIA ===================== */
const AssistenciaPage = lazy(
  () => import("@/pages/assistencia/AssistenciaPage")
);
const AssistenciaKanbanPage = lazy(
  () => import("@/pages/assistencia/AssistenciaKanbanPage")
);
const AssistenciaFormPage = lazy(
  () => import("@/pages/assistencia/AssistenciaFormPage")
);
const AssistenciaDetalhePage = lazy(
  () => import("@/pages/assistencia/AssistenciaDetalhePage")
);

/* ===================== LAZY IMPORTS - FINANCEIRO ===================== */
const FinanceiroDashboardNew = lazy(
  () => import("@/pages/financeiro/FinanceiroDashboardNew")
);
const LancamentosPage = lazy(
  () => import("@/pages/financeiro/LancamentosPage")
);

/* ===================== LAZY IMPORTS - FINANCEIRO PESSOAL ===================== */
const FinanceiroPessoalPage = lazy(() =>
  import("@/modules/financeiro-pessoal").then((m) => ({
    default: m.FinanceiroPessoalPage,
  }))
);
const ObrasFinanceiroPage = lazy(
  () => import("@/pages/financeiro/ObrasFinanceiroPage")
);
const SolicitacoesPage = lazy(
  () => import("@/pages/financeiro/SolicitacoesPage")
);
const ComissionamentoPage = lazy(
  () => import("@/pages/financeiro/ComissionamentoPage")
);
const ReembolsosPage = lazy(() => import("@/pages/financeiro/ReembolsosPage"));
const RelatoriosPage = lazy(() => import("@/pages/financeiro/RelatoriosPage"));
const CobrancasPage = lazy(() => import("@/pages/financeiro/CobrancasPage"));
const CategoriasPage = lazy(() => import("@/pages/financeiro/CategoriasPage"));
const ImportarExtratoPage = lazy(
  () => import("@/pages/financeiro/ImportarExtratoPage")
);
const ConfigFinanceiroPage = lazy(
  () => import("@/pages/financeiro/ConfigFinanceiroPage")
);

/* ===================== LAZY IMPORTS - CRONOGRAMA ===================== */
const CronogramaDashboardPage = lazy(
  () => import("@/pages/cronograma/CronogramaDashboardPage")
);
const CronogramaProjectsPage = lazy(
  () => import("@/pages/cronograma/CronogramaProjectsPage")
);
const ProjetoEquipePage = lazy(
  () => import("@/pages/cronograma/ProjetoEquipePage")
);
const CronogramaKanbanPageNew = lazy(
  () => import("@/pages/cronograma/CronogramaKanbanPage")
);
const CronogramaTeamsPage = lazy(
  () => import("@/pages/cronograma/CronogramaTeamsPage")
);
const CronogramaCatalogPage = lazy(
  () => import("@/pages/cronograma/CronogramaCatalogPage")
);
const GraficosPage = lazy(() => import("@/pages/cronograma/GraficosPage"));
const ProjectDetailPage = lazy(
  () => import("@/pages/cronograma/ProjectDetailPage")
);
const ProjetosFinanceirosPage = lazy(
  () => import("@/pages/cronograma/ProjetosFinanceirosPage")
);
const CronogramaTimelinePage = lazy(
  () => import("@/pages/cronograma/CronogramaTimelinePage")
);
const SuperCronogramaGanttPage = lazy(
  () => import("@/pages/cronograma/SuperCronogramaGanttPage")
);

/* ===================== LAZY IMPORTS - PLANEJAMENTO / ORÇAMENTOS ===================== */
const PlanejamentoDashboard = lazy(() => import("@/pages/planejamento/index"));
const NovoPedidoPage = lazy(
  () => import("@/pages/planejamento/NovoPedidoPage")
);
const OrcamentosPageNew = lazy(
  () => import("@/pages/planejamento/OrcamentosPage")
);
const AprovacoesPage = lazy(
  () => import("@/pages/planejamento/AprovacoesPage")
);
const ComposicoesPage = lazy(
  () => import("@/pages/planejamento/ComposicoesPage")
);
const OrcamentoMateriaisPage = lazy(
  () => import("@/pages/planejamento/OrcamentoMateriaisPage")
);
const PedidoMateriaisObraPage = lazy(
  () => import("@/pages/planejamento/PedidoMateriaisObraPage")
);
const PedidoMateriaisObraPage2 = lazy(
  () => import("@/pages/planejamento/PedidoMateriaisObraPage2")
);
const ConsolidacaoObraPage = lazy(
  () => import("@/pages/planejamento/ConsolidacaoObraPage")
);
const QuantitativosListPage = lazy(
  () => import("@/pages/quantitativos/QuantitativosListPage")
);
const QuantitativoFormPage = lazy(
  () => import("@/pages/quantitativos/QuantitativoFormPage")
);
const QuantitativoEditorPage = lazy(
  () => import("@/pages/quantitativos/QuantitativoEditorPage")
);
const NovoOrcamentoPage = lazy(
  () => import("@/pages/orcamentos/NovoOrcamentoPage")
);
const OrcamentoFormPage = lazy(
  () => import("@/pages/orcamentos/OrcamentosPage")
);
const OrcamentoItensPage = lazy(
  () => import("@/pages/orcamentos/OrcamentoItensPage")
);
const OrcamentoDetalhePage = lazy(
  () => import("@/pages/orcamentos/OrcamentoDetalhePage")
);
const ModelosOrcamentoPage = lazy(
  () => import("@/pages/orcamentos/ModelosOrcamentoPage")
);

/* ===================== LAZY IMPORTS - USUÁRIOS ===================== */
const UsuariosPage = lazy(() => import("@/pages/usuarios/UsuariosPage"));
const UsuarioFormPage = lazy(() => import("@/pages/usuarios/UsuarioFormPage"));
const UsuarioDetalhePage = lazy(
  () => import("@/pages/usuarios/UsuarioDetalhePage")
);

/* ===================== LAZY IMPORTS - SISTEMA ===================== */
const EmpresasPage = lazy(() => import("@/pages/sistema/EmpresasPage"));
const ModelosContratoPage = lazy(
  () => import("@/pages/sistema/ModelosContratoPage")
);
const ContasBancariasPage = lazy(
  () => import("@/pages/sistema/ContasBancariasPage")
);
const AreaClienteConfigPage = lazy(
  () => import("@/pages/sistema/AreaClienteConfigPage")
);
const AreaClienteCadastroPage = lazy(
  () => import("@/pages/sistema/area-cliente/AreaClienteCadastroPage")
);
const AreaClienteDrivePage = lazy(
  () => import("@/pages/sistema/area-cliente/AreaClienteDrivePage")
);
const PrecificacaoPage = lazy(() => import("@/pages/sistema/PrecificacaoPage"));
const ChecklistTemplatesPage = lazy(
  () => import("@/pages/sistema/ChecklistTemplatesPage")
);
const CadastrosPendentesPage = lazy(
  () => import("@/pages/sistema/CadastrosPendentesPage")
);
const CentralImportExportPage = lazy(
  () => import("@/pages/sistema/CentralImportExportPage")
);
const PlantaSistemaPage = lazy(
  () => import("@/pages/sistema/PlantaSistemaPage")
);
const CentralLinksPage = lazy(() => import("@/pages/sistema/CentralLinksPage"));
const SaudeDoSistemaPage = lazy(
  () => import("@/pages/sistema/SaudeDoSistemaPage")
);

/* ===================== LAZY IMPORTS - JURÍDICO ===================== */
const JuridicoDashboardPage = lazy(
  () => import("@/pages/juridico/JuridicoDashboardPage")
);
const JuridicoPage = lazy(() => import("@/pages/juridico/JuridicoPage"));
const ModeloContratoFormPage = lazy(
  () => import("@/pages/juridico/ModeloContratoFormPage")
);
const AssistenciaJuridicaPage = lazy(
  () => import("@/pages/juridico/AssistenciaJuridicaPage")
);
const FinanceiroJuridicoPage = lazy(
  () => import("@/pages/juridico/FinanceiroJuridicoPage")
);

/* ===================== LAZY IMPORTS - CLIENTE ===================== */
const ClienteArquivosPage = lazy(
  () => import("@/pages/cliente/ClienteArquivosPage")
);
const PosVendasPage = lazy(() => import("@/pages/cliente/PosVendasPage"));
const ConfirmacaoDadosPage = lazy(
  () => import("@/pages/cliente/ConfirmacaoDadosPage")
);
const CronogramaClientePage = lazy(
  () => import("@/pages/cliente/CronogramaClientePage")
);
const FinanceiroClientePage = lazy(
  () => import("@/pages/cliente/FinanceiroClientePage")
);
const TermoAceitePage = lazy(
  () => import("@/pages/termo-aceite/TermoAceitePage")
);
const GarantiaPage = lazy(() => import("@/pages/garantia/GarantiaPage"));

/* ===================== LAZY IMPORTS - PÚBLICO ===================== */
const CadastroPublicoPage = lazy(
  () => import("@/pages/cadastro-publico/CadastroPublicoPage")
);
const SolicitarPropostaPage = lazy(
  () => import("@/pages/publico/SolicitarPropostaPage")
);
const ApresentacaoSistemaPage = lazy(
  () => import("@/pages/publico/ApresentacaoSistemaPage")
);

/* ===================== LAZY IMPORTS - ÁREA DO COLABORADOR ===================== */
const ColaboradorLayout = lazy(() => import("@/layout/ColaboradorLayout"));
const ColaboradorOnlyRoute = lazy(() => import("@/auth/ColaboradorOnlyRoute"));
const ColaboradorDashboardPage = lazy(
  () => import("@/pages/colaborador/ColaboradorDashboardPage")
);
const ColaboradorProjetosPage = lazy(
  () => import("@/pages/colaborador/ColaboradorProjetosPage")
);
const ColaboradorFinanceiroPage = lazy(
  () => import("@/pages/colaborador/ColaboradorFinanceiroPage")
);
const ColaboradorSolicitacoesPage = lazy(
  () => import("@/pages/colaborador/ColaboradorSolicitacoesPage")
);
const ColaboradorServicosPage = lazy(
  () => import("@/pages/colaborador/ColaboradorServicosPage")
);
const ColaboradorMateriaisPage = lazy(
  () => import("@/pages/colaborador/ColaboradorMateriaisPage")
);
const ColaboradorNotificacoesPage = lazy(
  () => import("@/pages/colaborador/ColaboradorNotificacoesPage")
);
const ColaboradorDiarioObraPage = lazy(
  () => import("@/pages/colaborador/ColaboradorDiarioObraPage")
);
const ColaboradorPerfilPage = lazy(
  () => import("@/pages/colaborador/ColaboradorPerfilPage")
);
const NovaSolicitacaoPage = lazy(
  () => import("@/pages/colaborador/NovaSolicitacaoPage")
);

/* ===================== LAZY IMPORTS - ÁREA DO ESPECIFICADOR ===================== */
const EspecificadorLayout = lazy(() => import("@/layout/EspecificadorLayout"));
const EspecificadorOnlyRoute = lazy(
  () => import("@/auth/EspecificadorOnlyRoute")
);
const EspecificadorDashboardPage = lazy(
  () => import("@/pages/especificador/EspecificadorDashboardPage")
);
const EspecificadorContratosPage = lazy(
  () => import("@/pages/especificador/EspecificadorContratosPage")
);
const EspecificadorComissoesPage = lazy(
  () => import("@/pages/especificador/EspecificadorComissoesPage")
);
const EspecificadorPagamentosPage = lazy(
  () => import("@/pages/especificador/EspecificadorPagamentosPage")
);
const EspecificadorCronogramaPage = lazy(
  () => import("@/pages/especificador/EspecificadorCronogramaPage")
);

/* ===================== LAZY IMPORTS - ÁREA DO FORNECEDOR ===================== */
const FornecedorLayout = lazy(() => import("@/layout/FornecedorLayout"));
const FornecedorOnlyRoute = lazy(() => import("@/auth/FornecedorOnlyRoute"));
const FornecedorDashboardPage = lazy(
  () => import("@/pages/fornecedor/FornecedorDashboardPage")
);
const FornecedorCotacoesPage = lazy(
  () => import("@/pages/fornecedor/FornecedorCotacoesPage")
);
const FornecedorServicosPage = lazy(
  () => import("@/pages/fornecedor/FornecedorServicosPage")
);

/* ===================== LAZY IMPORTS - SERVIÇOS ===================== */
const ServicosPage = lazy(() =>
  import("@/modules/servicos").then((m) => ({ default: m.ServicosPage }))
);
const AceitarServicoPage = lazy(() =>
  import("@/modules/servicos").then((m) => ({ default: m.AceitarServicoPage }))
);

/* ===================== LAZY IMPORTS - OUTROS ===================== */
const WGExperienceClientesPage = lazy(
  () => import("@/pages/wg-experience/WGExperienceClientesPage")
);
const DepositoWGPage = lazy(() => import("@/pages/DepositoWGPage"));
const WgStorePage = lazy(() => import("@/pages/WgStorePage"));
// NOTA: Usando versão elegante da área do cliente (pages/cliente/)
const AreaClientePage = lazy(() => import("@/pages/cliente/AreaClientePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const SpotifyCallbackPage = lazy(() => import("@/pages/SpotifyCallbackPage"));
const LogoutPage = lazy(() => import("@/pages/LogoutPage"));

/* =============================================================== */
/* ========================= COMPONENTE APP ======================== */
/* =============================================================== */

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/login"
            element={<Navigate to="/login" replace />}
          />

          {/* SIGNUP - Criação de novas contas */}
          <Route
            path="/auth/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* RESET DE SENHA (sem autenticacao) */}
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* CONFIRMAÇÃO DE EMAIL */}
          <Route
            path="/auth/confirm-email/:token"
            element={
              <PublicRoute>
                <ConfirmEmailPage />
              </PublicRoute>
            }
          />

          {/* SPOTIFY CALLBACK (sem autenticacao) */}
          <Route
            path="/spotify-callback"
            element={
              <PublicRoute>
                <SpotifyCallbackPage />
              </PublicRoute>
            }
          />

          {/* CADASTRO PUBLICO (sem autenticacao) */}
          <Route
            path="/cadastro/:token"
            element={
              <PublicRoute>
                <CadastroPublicoPage />
              </PublicRoute>
            }
          />

          {/* SOLICITAR PROPOSTA - Página pública com vídeo de fundo */}
          <Route
            path="/solicite-sua-proposta"
            element={
              <PublicRoute>
                <SolicitarPropostaPage />
              </PublicRoute>
            }
          />

          {/* APRESENTAÇÃO DO SISTEMA - Página pública animada */}
          <Route
            path="/conheca-wgx"
            element={
              <PublicRoute>
                <ApresentacaoSistemaPage />
              </PublicRoute>
            }
          />

          {/* AÇÃO DO CLIENTE NA PROPOSTA - Aprovar/Recusar (público) */}
          <Route
            path="/proposta/:id/:acao"
            element={
              <PublicRoute>
                <PropostaAcaoClientePage />
              </PublicRoute>
            }
          />

          {/* ACEITAR SERVIÇO - Página pública para prestadores */}
          <Route
            path="/servico/aceitar/:token"
            element={
              <PublicRoute>
                <AceitarServicoPage />
              </PublicRoute>
            }
          />
          <Route
            path="/servico/aceitar/p/:token"
            element={
              <PublicRoute>
                <AceitarServicoPage />
              </PublicRoute>
            }
          />

          {/* ÁREA DO CLIENTE - PROTEGIDA (requer autenticação de cliente) */}
          <Route
            path="/area-cliente"
            element={
              <ClienteOnlyRoute>
                <AreaClientePage />
              </ClienteOnlyRoute>
            }
          />
          <Route
            path="/area-cliente/:clienteId"
            element={
              <ClienteOnlyRoute>
                <AreaClientePage />
              </ClienteOnlyRoute>
            }
          />
          <Route
            path="/area-cliente/arquivos"
            element={
              <ClienteOnlyRoute>
                <ClienteArquivosPage />
              </ClienteOnlyRoute>
            }
          />

          {/* PÁGINA DE CONFIRMAÇÃO DE DADOS - SEM LAYOUT (tela própria) */}
          <Route
            path="/wgx/confirmar-dados"
            element={
              <ClienteOnlyRoute>
                <ConfirmacaoDadosPage />
              </ClienteOnlyRoute>
            }
          />

          {/* ÁREA WGxperience - EXCLUSIVA PARA CLIENTES (sem sidebar) */}
          <Route
            path="/wgx"
            element={
              <ClienteOnlyRoute>
                <ClienteLayout />
              </ClienteOnlyRoute>
            }
          >
            <Route index element={<AreaClientePage />} />
            <Route path="cronograma" element={<CronogramaClientePage />} />
            <Route path="financeiro" element={<FinanceiroClientePage />} />
            <Route path="assistencia" element={<AssistenciaPage />} />
            <Route path="termos" element={<TermoAceitePage />} />
            <Route path="garantia" element={<GarantiaPage />} />
          </Route>

          {/* ÁREA DO COLABORADOR - EXCLUSIVA PARA COLABORADORES INTERNOS WG */}
          <Route
            path="/colaborador"
            element={
              <Suspense fallback={<PageLoader />}>
                <ColaboradorOnlyRoute>
                  <ColaboradorLayout />
                </ColaboradorOnlyRoute>
              </Suspense>
            }
          >
            <Route index element={<ColaboradorDashboardPage />} />
            <Route path="projetos" element={<ColaboradorProjetosPage />} />
            <Route path="servicos" element={<ColaboradorServicosPage />} />
            <Route path="materiais" element={<ColaboradorMateriaisPage />} />
            <Route path="financeiro" element={<ColaboradorFinanceiroPage />} />
            <Route
              path="solicitacoes"
              element={<ColaboradorSolicitacoesPage />}
            />
            <Route path="solicitacoes/nova" element={<NovaSolicitacaoPage />} />
            <Route
              path="notificacoes"
              element={<ColaboradorNotificacoesPage />}
            />
            <Route path="diario-obra" element={<ColaboradorDiarioObraPage />} />
            <Route path="perfil" element={<ColaboradorPerfilPage />} />
          </Route>

          {/* ÁREA DO ESPECIFICADOR - EXCLUSIVA PARA ESPECIFICADORES */}
          <Route
            path="/especificador"
            element={
              <Suspense fallback={<PageLoader />}>
                <EspecificadorOnlyRoute>
                  <EspecificadorLayout />
                </EspecificadorOnlyRoute>
              </Suspense>
            }
          >
            <Route index element={<EspecificadorDashboardPage />} />
            <Route path="contratos" element={<EspecificadorContratosPage />} />
            <Route path="comissoes" element={<EspecificadorComissoesPage />} />
            <Route
              path="pagamentos"
              element={<EspecificadorPagamentosPage />}
            />
            <Route
              path="cronograma"
              element={<EspecificadorCronogramaPage />}
            />
          </Route>

          {/* ÁREA DO FORNECEDOR - EXCLUSIVA PARA FORNECEDORES/PRESTADORES */}
          <Route
            path="/fornecedor"
            element={
              <Suspense fallback={<PageLoader />}>
                <FornecedorOnlyRoute>
                  <FornecedorLayout />
                </FornecedorOnlyRoute>
              </Suspense>
            }
          >
            <Route index element={<FornecedorDashboardPage />} />
            <Route path="cotacoes" element={<FornecedorCotacoesPage />} />
            <Route path="servicos" element={<FornecedorServicosPage />} />
          </Route>

          {/* PROTEGIDAS - Redireciona CLIENTES para /wgx */}
          <Route
            path="/"
            element={
              <ClienteProtectedRoute>
                <MainLayout />
              </ClienteProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />

            {/* PESSOAS */}
            <Route
              path="/pessoas"
              element={<Navigate to="/pessoas/clientes" replace />}
            />
            <Route path="/pessoas/clientes" element={<ClientesPage />} />
            <Route
              path="/pessoas/clientes/novo"
              element={<ClienteFormPage />}
            />
            <Route
              path="/pessoas/clientes/editar/:id"
              element={<ClienteFormPage />}
            />
            <Route
              path="/pessoas/clientes/:id"
              element={<PessoaDetalhePage />}
            />

            <Route
              path="/pessoas/colaboradores"
              element={<ColaboradoresPage />}
            />
            <Route
              path="/pessoas/colaboradores/novo"
              element={<ColaboradorFormPage />}
            />
            <Route
              path="/pessoas/colaboradores/editar/:id"
              element={<ColaboradorFormPage />}
            />
            <Route
              path="/pessoas/colaboradores/:id"
              element={<PessoaDetalhePage />}
            />

            <Route
              path="/pessoas/fornecedores"
              element={<FornecedoresPage />}
            />
            <Route
              path="/pessoas/fornecedores/novo"
              element={<FornecedorFormPage />}
            />
            <Route
              path="/pessoas/fornecedores/editar/:id"
              element={<FornecedorFormPage />}
            />
            <Route
              path="/pessoas/fornecedores/:id"
              element={<PessoaDetalhePage />}
            />

            <Route
              path="/pessoas/especificadores"
              element={<EspecificadoresPage />}
            />
            <Route
              path="/pessoas/especificadores/novo"
              element={<EspecificadorFormPage />}
            />
            <Route
              path="/pessoas/especificadores/editar/:id"
              element={<EspecificadorFormPage />}
            />
            <Route
              path="/pessoas/especificadores/:id"
              element={<PessoaDetalhePage />}
            />

            <Route path="/pessoas/importar" element={<ImportarPessoasPage />} />
            <Route
              path="/pessoas/exportar-importar"
              element={<ExportarImportarPessoasPage />}
            />

            {/* OPORTUNIDADES */}
            <Route
              path="/oportunidades"
              element={<OportunidadesKanbanPage />}
            />
            <Route
              path="/oportunidades/novo"
              element={<OportunidadeFormPage />}
            />
            <Route
              path="/oportunidades/editar/:id"
              element={<OportunidadeFormPage />}
            />
            <Route
              path="/oportunidades/kanban/:nucleo"
              element={<NucleoKanbanPage />}
            />

            {/* NÚCLEOS */}
            <Route
              path="/arquitetura/kanban"
              element={
                <Navigate replace to="/oportunidades/kanban/arquitetura" />
              }
            />
            <Route
              path="/arquitetura"
              element={
                <Navigate replace to="/oportunidades/kanban/arquitetura" />
              }
            />
            <Route
              path="/engenharia/kanban"
              element={
                <Navigate replace to="/oportunidades/kanban/engenharia" />
              }
            />
            <Route
              path="/engenharia"
              element={
                <Navigate replace to="/oportunidades/kanban/engenharia" />
              }
            />
            <Route
              path="/marcenaria"
              element={
                <Navigate replace to="/oportunidades/kanban/marcenaria" />
              }
            />
            <Route
              path="/marcenaria/kanban"
              element={
                <Navigate replace to="/oportunidades/kanban/marcenaria" />
              }
            />

            {/* ANÁLISE DE PROJETO */}
            <Route
              path="/analise-projeto"
              element={<AnaliseProjetoListPage />}
            />
            <Route
              path="/analise-projeto/nova"
              element={<AnaliseProjetoEditorPage />}
            />
            <Route
              path="/analise-projeto/:id"
              element={<AnaliseProjetoEditorPage />}
            />

            {/* EVF - ESTUDO DE VIABILIDADE FINANCEIRA */}
            <Route path="/evf" element={<EVFPage />} />
            <Route path="/evf/novo" element={<EVFEditorPage />} />
            <Route path="/evf/:id" element={<EVFEditorPage />} />

            {/* PROPOSTAS - Versão V3 Nova Estrutura (Cliente + Analise + Nucleos) */}
            <Route path="/propostas" element={<PropostasPage />} />
            <Route path="/propostas/nova" element={<PropostaEmissaoPageV3 />} />
            <Route
              path="/propostas/:id/visualizar"
              element={<PropostaEmissaoPage />}
            />
            <Route
              path="/propostas/:id/editar"
              element={<PropostaEmissaoPageV3 />}
            />
            <Route
              path="/propostas/cliente/:clienteId"
              element={<ClientePropostasPage />}
            />
            {/* PROPOSTAS V2 - Layout 3 Colunas (compatibilidade) */}
            <Route
              path="/propostas/v2/nova"
              element={<PropostaEmissaoPageV2 />}
            />
            <Route
              path="/propostas/v2/:id/editar"
              element={<PropostaEmissaoPageV2 />}
            />
            {/* PROPOSTAS V1 - Versão antiga (mantida para compatibilidade) */}
            <Route
              path="/propostas/v1/nova"
              element={<PropostaEmissaoPage />}
            />
            <Route
              path="/propostas/v1/:id/editar"
              element={<PropostaEmissaoPage />}
            />

            {/* CONTRATOS */}
            <Route path="/contratos" element={<ContratosKanbanPage />} />
            <Route path="/contratos/lista" element={<ContratosPage />} />
            <Route path="/contratos/novo" element={<ContratoFormPage />} />
            <Route
              path="/contratos/editar/:id"
              element={<ContratoFormPage />}
            />
            <Route path="/contratos/:id" element={<ContratoDetalhePage />} />

            {/* FINANCEIRO */}
            <Route path="/financeiro" element={<FinanceiroDashboardNew />} />
            <Route
              path="/financeiro/lancamentos"
              element={<LancamentosPage />}
            />
            <Route path="/financeiro/obras" element={<ObrasFinanceiroPage />} />
            <Route
              path="/financeiro/solicitacoes"
              element={<SolicitacoesPage />}
            />
            <Route
              path="/financeiro/comissionamento"
              element={<ComissionamentoPage />}
            />
            <Route path="/financeiro/reembolsos" element={<ReembolsosPage />} />
            <Route path="/financeiro/relatorios" element={<RelatoriosPage />} />
            <Route path="/financeiro/cobrancas" element={<CobrancasPage />} />
            <Route path="/financeiro/categorias" element={<CategoriasPage />} />
            <Route
              path="/financeiro/importar-extrato"
              element={<ImportarExtratoPage />}
            />
            <Route
              path="/financeiro/config"
              element={<ConfigFinanceiroPage />}
            />
            <Route
              path="/financeiro/plano-contas"
              element={<ConfigFinanceiroPage />}
            />

            {/* MEU FINANCEIRO - FINANCEIRO PESSOAL */}
            <Route path="/meu-financeiro" element={<FinanceiroPessoalPage />} />

            {/* CRONOGRAMA */}
            <Route path="/cronograma" element={<CronogramaDashboardPage />} />
            <Route
              path="/cronograma/projects"
              element={<CronogramaProjectsPage />}
            />
            <Route
              path="/cronograma/projects/:id"
              element={<ProjectDetailPage />}
            />
            <Route
              path="/cronograma/projects/:id/equipe"
              element={<ProjetoEquipePage />}
            />
            <Route path="/cronograma/teams" element={<CronogramaTeamsPage />} />
            <Route
              path="/cronograma/catalog"
              element={<CronogramaCatalogPage />}
            />
            <Route path="/cronograma/graficos" element={<GraficosPage />} />
            <Route
              path="/cronograma/kanban"
              element={<CronogramaKanbanPageNew />}
            />

            {/* CRONOGRAMA - PROJETOS FINANCEIROS */}
            <Route
              path="/cronograma/financeiro"
              element={<ProjetosFinanceirosPage />}
            />
            <Route
              path="/cronograma/projeto/:id/timeline"
              element={<CronogramaTimelinePage />}
            />
            <Route
              path="/cronograma/projeto/:projetoId/gantt"
              element={<SuperCronogramaGanttPage />}
            />

            {/* LISTA DE COMPRAS V2 (por projeto) */}
            <Route
              path="/projetos/:projetoId/lista-compras"
              element={<ListaComprasV2Page />}
            />
            <Route
              path="/cronograma/projects/:projetoId/lista-compras"
              element={<ListaComprasV2Page />}
            />

            {/* PLANEJAMENTO / ORÇAMENTOS */}
            {/* Dashboard Principal (NOVO) */}
            <Route path="/planejamento" element={<PlanejamentoDashboard />} />
            {/* Wizard Unificado (NOVO) */}
            <Route path="/planejamento/novo" element={<NovoPedidoPage />} />

            <Route path="/quantitativos" element={<QuantitativosListPage />} />
            <Route
              path="/quantitativos/novo"
              element={<QuantitativoFormPage />}
            />
            <Route
              path="/quantitativos/editar/:id"
              element={<QuantitativoFormPage />}
            />
            <Route
              path="/quantitativos/:id/editor"
              element={<QuantitativoEditorPage />}
            />
            <Route
              path="/planejamento/orcamentos"
              element={<OrcamentosPageNew />}
            />
            <Route
              path="/planejamento/orcamentos/modelos"
              element={<ModelosOrcamentoPage />}
            />
            <Route
              path="/planejamento/composicoes"
              element={<ComposicoesPage />}
            />
            <Route
              path="/planejamento/orcamentos/composicoes"
              element={<ComposicoesPage />}
            />
            <Route
              path="/planejamento/orcamentos/materiais"
              element={<OrcamentoMateriaisPage />}
            />
            {/* Rotas antigas mantidas para compatibilidade */}
            <Route
              path="/planejamento/pedido-materiais"
              element={<PedidoMateriaisObraPage />}
            />
            <Route
              path="/planejamento/pedido-materiais-2"
              element={<PedidoMateriaisObraPage2 />}
            />
            <Route
              path="/planejamento/consolidacao"
              element={<ConsolidacaoObraPage />}
            />
            <Route
              path="/planejamento/orcamentos/novo"
              element={<NovoOrcamentoPage />}
            />
            <Route
              path="/planejamento/orcamentos/:id"
              element={<OrcamentoDetalhePage />}
            />
            <Route
              path="/planejamento/orcamentos/:id/itens"
              element={<OrcamentoItensPage />}
            />
            <Route
              path="/planejamento/aprovacoes"
              element={<AprovacoesPage />}
            />
            {/* aliases/atalhos */}
            <Route path="/orcamentos" element={<OrcamentosPageNew />} />
            <Route path="/orcamentos/novo" element={<NovoOrcamentoPage />} />
            <Route
              path="/orcamentos/editar/:id"
              element={<NovoOrcamentoPage />}
            />
            <Route path="/orcamentos/:id" element={<OrcamentoDetalhePage />} />
            <Route
              path="/orcamentos/:id/itens"
              element={<OrcamentoItensPage />}
            />
            <Route
              path="/orcamentos/formulario"
              element={<OrcamentoFormPage />}
            />
            <Route
              path="/orcamentos/formulario/:id"
              element={<OrcamentoFormPage />}
            />

            {/* COMPRAS */}
            <Route path="/compras" element={<ComprasPage />} />
            <Route path="/compras/kanban" element={<ComprasKanbanPage />} />
            <Route path="/compras/lista" element={<ListaComprasPage />} />
            <Route path="/compras/novo" element={<PedidoCompraFormPage />} />
            <Route
              path="/compras/editar/:id"
              element={<PedidoCompraFormPage />}
            />
            <Route path="/compras/importar" element={<ImportarProdutoPage />} />
            <Route path="/compras/:id" element={<ComprasDetalhePage />} />

            {/* SERVIÇOS */}
            <Route path="/servicos" element={<ServicosPage />} />

            {/* ASSISTÊNCIA */}
            <Route path="/assistencia" element={<AssistenciaPage />} />
            <Route
              path="/assistencia/kanban"
              element={<AssistenciaKanbanPage />}
            />
            <Route path="/assistencia/nova" element={<AssistenciaFormPage />} />
            <Route
              path="/assistencia/editar/:id"
              element={<AssistenciaFormPage />}
            />
            <Route
              path="/assistencia/:id"
              element={<AssistenciaDetalhePage />}
            />

            {/* USUÁRIOS */}
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/novo" element={<UsuarioFormPage />} />
            <Route path="/usuarios/editar/:id" element={<UsuarioFormPage />} />
            <Route path="/usuarios/:id" element={<UsuarioDetalhePage />} />

            {/* JURÍDICO */}
            <Route path="/juridico" element={<JuridicoDashboardPage />} />
            <Route
              path="/juridico/assistencia"
              element={<AssistenciaJuridicaPage />}
            />
            <Route
              path="/juridico/financeiro"
              element={<FinanceiroJuridicoPage />}
            />
            <Route path="/juridico/empresas" element={<EmpresasPage />} />
            <Route path="/juridico/modelos" element={<JuridicoPage />} />
            <Route path="/juridico/novo" element={<ModeloContratoFormPage />} />
            <Route
              path="/juridico/editar/:id"
              element={<ModeloContratoFormPage />}
            />

            {/* SISTEMA */}
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route
              path="/modelos-contrato"
              element={<Navigate replace to="/juridico/modelos" />}
            />
            <Route path="/contas-bancarias" element={<ContasBancariasPage />} />
            <Route
              path="/sistema/area-cliente"
              element={<AreaClienteConfigPage />}
            />
            <Route
              path="/sistema/area-cliente/clientes"
              element={<AreaClienteCadastroPage />}
            />
            <Route
              path="/sistema/area-cliente/drive"
              element={<AreaClienteDrivePage />}
            />
            <Route
              path="/sistema/precificacao"
              element={<PrecificacaoPage />}
            />
            <Route
              path="/sistema/checklists"
              element={<ChecklistTemplatesPage />}
            />
            <Route
              path="/sistema/cadastros-pendentes"
              element={<CadastrosPendentesPage />}
            />
            <Route
              path="/sistema/importar-exportar"
              element={<CentralImportExportPage />}
            />
            <Route path="/sistema/planta" element={<PlantaSistemaPage />} />
            <Route
              path="/sistema/central-links"
              element={<CentralLinksPage />}
            />
            <Route path="/sistema/saude" element={<SaudeDoSistemaPage />} />
            <Route path="/pricelist" element={<PricelistPage />} />
            <Route path="/pricelist/novo" element={<PricelistItemFormPage />} />
            <Route
              path="/pricelist/editar/:id"
              element={<PricelistItemFormPage />}
            />
            <Route path="/pricelist/:id" element={<PricelistItemFormPage />} />
            <Route
              path="/pricelist/categorias"
              element={<GerenciarCategoriasPage />}
            />
            <Route
              path="/pricelist/subcategorias"
              element={<Navigate replace to="/pricelist/categorias" />}
            />
            <Route
              path="/pricelist/gerenciar-categorias"
              element={<Navigate replace to="/pricelist/categorias" />}
            />
            <Route
              path="/pricelist/importar"
              element={<Navigate replace to="/pricelist/exportar-importar" />}
            />
            <Route
              path="/pricelist/importar-catalogo"
              element={<ImportarCatalogoIAPage />}
            />
            <Route
              path="/pricelist/importar-catalogo-excel"
              element={<ImportarCatalogoExcelPage />}
            />
            <Route
              path="/pricelist/importar-imagens"
              element={<ImportarImagensPage />}
            />
            <Route
              path="/pricelist/importar-lote"
              element={<ImportarLotePage />}
            />
            <Route
              path="/pricelist/exportar-importar"
              element={<ExportarImportarPricelistPage />}
            />

            {/* PORTAL DO CLIENTE - PREVIEW ADMIN (dentro do MainLayout) */}
            <Route path="/portal-cliente" element={<AreaClientePage />} />
            <Route
              path="/portal-cliente/arquivos"
              element={<ClienteArquivosPage />}
            />
            <Route
              path="/portal-cliente/cronograma"
              element={<CronogramaClientePage />}
            />
            <Route
              path="/portal-cliente/financeiro"
              element={<FinanceiroClientePage />}
            />
            <Route
              path="/portal-cliente/pos-vendas"
              element={<PosVendasPage />}
            />

            {/* OUTROS */}
            <Route
              path="/wg-experience/clientes"
              element={<WGExperienceClientesPage />}
            />
            <Route path="/deposito" element={<DepositoWGPage />} />
            <Route path="/wg-store" element={<WgStorePage />} />
            <Route
              path="/memorial-acabamentos"
              element={<MemorialAcabamentosPage />}
            />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/termo-aceite" element={<TermoAceitePage />} />
            <Route path="/garantia" element={<GarantiaPage />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
