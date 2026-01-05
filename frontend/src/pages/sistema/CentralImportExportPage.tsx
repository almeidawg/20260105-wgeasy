// ============================================================
// PÁGINA: Central de Importação/Exportação
// Sistema WG Easy - Grupo WG Almeida
// Hub centralizado para todas as operações de importação e exportação
// ============================================================

import { useNavigate } from "react-router-dom";

interface ModuloImportExport {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  corHover: string;
  rota: string;
  funcionalidades: string[];
  disponivel: boolean;
}

const modulosDisponiveis: ModuloImportExport[] = [
  {
    id: "pricelist",
    nome: "Pricelist",
    descricao: "Catálogo de produtos e serviços com precificação automática",
    icone: "📦",
    cor: "bg-purple-100",
    corHover: "hover:bg-purple-200",
    rota: "/pricelist/exportar-importar",
    funcionalidades: [
      "Exportar todos os itens para Excel",
      "Importar itens com cálculo automático de preço",
      "Suporte a formato brasileiro (R$ 1.500,00)",
      "Fórmula de precificação por núcleo",
    ],
    disponivel: true,
  },
  {
    id: "pessoas",
    nome: "Pessoas",
    descricao: "Clientes, fornecedores, colaboradores e especificadores",
    icone: "👥",
    cor: "bg-blue-100",
    corHover: "hover:bg-blue-200",
    rota: "/pessoas/exportar-importar",
    funcionalidades: [
      "Exportar por tipo de pessoa",
      "Importar clientes, fornecedores, etc.",
      "Validação de campos obrigatórios",
      "Detecção automática de duplicatas",
    ],
    disponivel: true,
  },
  {
    id: "financeiro",
    nome: "Extrato Bancário",
    descricao: "Importar extratos de bancos para conciliação",
    icone: "💰",
    cor: "bg-green-100",
    corHover: "hover:bg-green-200",
    rota: "/financeiro/importar-extrato",
    funcionalidades: [
      "Suporte a múltiplos formatos de banco",
      "Detecção automática de categorias",
      "Conciliação com lançamentos existentes",
      "Parser para formato brasileiro",
    ],
    disponivel: true,
  },
  {
    id: "pricelist-ia",
    nome: "Catálogos (IA)",
    descricao: "Importar catálogos de fornecedores com inteligência artificial",
    icone: "🤖",
    cor: "bg-orange-100",
    corHover: "hover:bg-orange-200",
    rota: "/pricelist/importar-catalogo",
    funcionalidades: [
      "Processamento com IA",
      "Extração automática de dados",
      "Detecção de duplicatas",
      "Categorização inteligente",
    ],
    disponivel: true,
  },
  {
    id: "propostas",
    nome: "Propostas",
    descricao: "Exportar e importar propostas comerciais",
    icone: "📄",
    cor: "bg-yellow-100",
    corHover: "hover:bg-yellow-200",
    rota: "/propostas/exportar-importar",
    funcionalidades: [
      "Exportar propostas para Excel",
      "Backup de propostas",
      "Relatórios consolidados",
    ],
    disponivel: false, // Em breve
  },
  {
    id: "contratos",
    nome: "Contratos",
    descricao: "Exportar e importar contratos",
    icone: "📑",
    cor: "bg-indigo-100",
    corHover: "hover:bg-indigo-200",
    rota: "/contratos/exportar-importar",
    funcionalidades: [
      "Exportar contratos para Excel",
      "Relatórios de contratos ativos",
      "Histórico de faturamento",
    ],
    disponivel: false, // Em breve
  },
];

export default function CentralImportExportPage() {
  const navigate = useNavigate();

  const modulosAtivos = modulosDisponiveis.filter((m) => m.disponivel);
  const modulosEmBreve = modulosDisponiveis.filter((m) => !m.disponivel);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2E2E2E] flex items-center gap-3">
          <span className="text-3xl">📥</span>
          Central de Importação / Exportação
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie a importação e exportação de dados de todos os módulos do sistema em um único lugar.
        </p>
      </div>

      {/* Módulos Disponíveis */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Módulos Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modulosAtivos.map((modulo) => (
            <div
              key={modulo.id}
              onClick={() => navigate(modulo.rota)}
              className={`${modulo.cor} ${modulo.corHover} border border-gray-200 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{modulo.icone}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-gray-700">
                    {modulo.nome}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{modulo.descricao}</p>

                  <div className="mt-3 space-y-1">
                    {modulo.funcionalidades.slice(0, 3).map((func, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {func}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Módulos Em Breve */}
      {modulosEmBreve.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Em Breve
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulosEmBreve.map((modulo) => (
              <div
                key={modulo.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-60"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl grayscale">{modulo.icone}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-600 text-lg flex items-center gap-2">
                      {modulo.nome}
                      <span className="text-xs font-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                        Em breve
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{modulo.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruções Gerais */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Como funciona
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">1. Exportar</h4>
            <p className="text-sm text-gray-600">
              Baixe os dados atuais em formato Excel para revisão ou backup
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">2. Editar</h4>
            <p className="text-sm text-gray-600">
              Faça alterações na planilha usando Excel ou Google Sheets
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">3. Importar</h4>
            <p className="text-sm text-gray-600">
              Faça upload da planilha e revise antes de confirmar
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Dicas importantes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Todos os módulos suportam formato brasileiro (R$ 1.500,00)</li>
            <li>• A importação sempre mostra um preview antes de confirmar</li>
            <li>• Mantenha os cabeçalhos das colunas para garantir a importação correta</li>
            <li>• Campos obrigatórios são validados automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
