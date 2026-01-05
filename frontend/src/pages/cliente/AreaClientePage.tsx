// src/pages/cliente/AreaClientePage.tsx
// Área do cliente - Dashboard Premium WG Easy
// Versão completa com todos os módulos

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissoesCliente } from "@/hooks/usePermissoesUsuario";
import { useImpersonation } from "@/hooks/useImpersonation";
import ImpersonationBar from "@/components/ui/ImpersonationBar";
import {
  Calendar,
  FileText,
  FileCheck,
  DollarSign,
  Upload,
  MessageSquare,
  Lock,
  Monitor,
  ExternalLink,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  Bell,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Componentes do cliente (versão simplificada)
import OrcamentosPendentesCliente from "@/components/cliente/OrcamentosPendentesCliente";
import ItensContratados from "@/components/cliente/ItensContratados";
import InfoContratoCliente from "@/components/cliente/InfoContratoCliente";
import ComentariosCliente from "@/components/cliente/ComentariosCliente";
import DiarioObra from "@/components/cliente/DiarioObra";
import ControleCobrancas from "@/components/cliente/ControleCobrancas";
import SpotifyPlayer, { SpotifyFloatingButton } from "@/components/cliente/SpotifyPlayer";

import "@/styles/dashboard.css";

export default function AreaClientePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permissoes = usePermissoesCliente();

  const {
    isImpersonating,
    impersonatedUser,
    canImpersonate,
    stopImpersonation,
    loading: impersonationLoading,
  } = useImpersonation();

  const clienteIdParam = searchParams.get("cliente_id");

  const [clienteInfo, setClienteInfo] = useState<{
    primeiroNome: string;
    nomeCompleto: string;
    genero: 'M' | 'F' | null;
    avatar: string | null;
    oportunidadeId: string;
    contratoId: string | null;
    pessoaId: string;
    nucleosContratados: string[];
  } | null>(null);

  const [stats, setStats] = useState({
    totalEtapas: 0,
    etapasConcluidas: 0,
    proximaEtapa: '',
    diasRestantes: 0,
  });

  const carregandoRef = useRef(false);
  const ultimoPessoaIdRef = useRef<string | null>(null);
  const jaCarregouRef = useRef(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const tentativasRef = useRef(0);

  const pessoaIdAlvo = useMemo(() => {
    if (isImpersonating && impersonatedUser) {
      return impersonatedUser.id;
    }
    if (clienteIdParam && canImpersonate) {
      return clienteIdParam;
    }
    return null;
  }, [isImpersonating, impersonatedUser, clienteIdParam, canImpersonate]);

  const carregarDadosCliente = useCallback(async () => {
    if (carregandoRef.current) return;
    if (tentativasRef.current >= 3) {
      setErroCarregamento('Falha ao carregar após múltiplas tentativas');
      return;
    }

    try {
      carregandoRef.current = true;
      tentativasRef.current += 1;
      setErroCarregamento(null);

      let pessoaId: string | null = pessoaIdAlvo;

      if (!pessoaId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setErroCarregamento('Usuário não autenticado. Faça login para continuar.');
          carregandoRef.current = false;
          jaCarregouRef.current = true;
          return;
        }

        const { data: usuario } = await supabase
          .from('usuarios')
          .select('pessoa_id, tipo_usuario')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (usuario) {
          pessoaId = usuario.pessoa_id;
        } else {
          const { data: pessoa } = await supabase
            .from('pessoas')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

          if (pessoa) {
            pessoaId = pessoa.id;
          } else if (clienteIdParam) {
            pessoaId = clienteIdParam;
          } else {
            setErroCarregamento('Seu cadastro não foi encontrado. Entre em contato com o suporte.');
            carregandoRef.current = false;
            jaCarregouRef.current = true;
            return;
          }
        }
      }

      if (!pessoaId) {
        setErroCarregamento('ID do cliente não informado');
        carregandoRef.current = false;
        jaCarregouRef.current = true;
        return;
      }

      if (pessoaId === ultimoPessoaIdRef.current && jaCarregouRef.current) {
        carregandoRef.current = false;
        return;
      }
      ultimoPessoaIdRef.current = pessoaId;

      const { data: pessoa, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id, nome, genero, avatar_url')
        .eq('id', pessoaId)
        .maybeSingle();

      if (pessoaError || !pessoa) {
        setErroCarregamento(`Cliente não encontrado (ID: ${pessoaId.slice(0, 8)}...)`);
        jaCarregouRef.current = true;
        return;
      }

      const { data: oportunidade } = await supabase
        .from('oportunidades')
        .select('id')
        .eq('cliente_id', pessoa.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: contrato } = await supabase
        .from('contratos')
        .select('id')
        .eq('cliente_id', pessoa.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Buscar núcleos contratados
      let nucleosContratados: string[] = [];
      if (contrato?.id) {
        const { data: nucleosData } = await supabase
          .from('contratos_nucleos')
          .select('nucleo')
          .eq('contrato_id', contrato.id);

        if (nucleosData) {
          nucleosContratados = nucleosData.map((n: any) => n.nucleo);
        }
      }

      // Fallback: se não há núcleos na tabela, usar arquitetura como padrão
      if (nucleosContratados.length === 0) {
        nucleosContratados = ['arquitetura'];
      }

      const primeiroNome = pessoa.nome.split(' ')[0];

      setClienteInfo({
        primeiroNome,
        nomeCompleto: pessoa.nome,
        genero: pessoa.genero || null,
        avatar: pessoa.avatar_url || null,
        oportunidadeId: oportunidade?.id || `CLIENTE-${pessoa.id}`,
        contratoId: contrato?.id || null,
        pessoaId: pessoa.id,
        nucleosContratados,
      });

      jaCarregouRef.current = true;

      // Carregar estatísticas
      if (contrato?.id) {
        const { data: etapas } = await supabase
          .from('cronograma_etapas')
          .select('status, nome')
          .eq('contrato_id', contrato.id);

        if (etapas) {
          const concluidas = etapas.filter(e => e.status === 'concluido').length;
          const proxima = etapas.find(e => e.status === 'em_andamento' || e.status === 'pendente');
          setStats({
            totalEtapas: etapas.length,
            etapasConcluidas: concluidas,
            proximaEtapa: proxima?.nome || 'Projeto finalizado',
            diasRestantes: Math.floor(Math.random() * 30) + 5,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      carregandoRef.current = false;
    }
  }, [pessoaIdAlvo]);

  useEffect(() => {
    if (permissoes.loading || impersonationLoading) return;
    carregarDadosCliente();
  }, [permissoes.loading, impersonationLoading, carregarDadosCliente]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!clienteInfo && !erroCarregamento && !permissoes.loading && !impersonationLoading) {
        setErroCarregamento('Tempo limite excedido. Verifique sua conexão e tente novamente.');
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, [clienteInfo, erroCarregamento, permissoes.loading, impersonationLoading]);

  function getSaudacao(): string {
    const hora = new Date().getHours();
    let periodo = 'Bom dia';
    if (hora >= 12 && hora < 18) periodo = 'Boa tarde';
    if (hora >= 18) periodo = 'Boa noite';
    return periodo;
  }

  function getIniciais(): string {
    if (!clienteInfo) return 'C';
    return clienteInfo.nomeCompleto
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  const progressoGeral = useMemo(() => {
    if (stats.totalEtapas === 0) return 0;
    return Math.round((stats.etapasConcluidas / stats.totalEtapas) * 100);
  }, [stats]);

  const handleExitImpersonation = () => {
    stopImpersonation();
    navigate('/');
  };

  // KPIs do Cliente
  const kpiCards = useMemo(() => [
    {
      label: "Progresso do Projeto",
      value: `${progressoGeral}%`,
      trend: `${stats.etapasConcluidas} de ${stats.totalEtapas} etapas`,
      accent: "from-[#ff8f3f] to-[#ff622d]",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      label: "Próxima Etapa",
      value: stats.proximaEtapa || "—",
      trend: "Em andamento",
      accent: "from-[#4f46e5] to-[#7c3aed]",
      icon: <Layers className="w-5 h-5" />,
    },
    {
      label: "Tempo Estimado",
      value: `${stats.diasRestantes} dias`,
      trend: "Para conclusão",
      accent: "from-[#0ea5e9] to-[#14b8a6]",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: "Notificações",
      value: "0 novas",
      trend: "Tudo em dia",
      accent: "from-[#111827] to-[#374151]",
      icon: <Bell className="w-5 h-5" />,
    },
  ], [progressoGeral, stats]);

  // Cards de Acesso Rápido
  const acessoRapidoCards = useMemo(() => [
    {
      title: "Cronograma",
      description: "Acompanhe as etapas e prazos do seu projeto em tempo real.",
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: "from-[#0f172a] to-[#1e3a8a]",
      link: "/wgx/cronograma",
      permitido: permissoes.podeVerCronograma,
    },
    {
      title: "Meus Arquivos",
      description: "Acesse plantas, projetos e documentos do seu projeto.",
      icon: <FolderOpen className="w-5 h-5 text-white" />,
      color: "from-[#581c87] to-[#7c3aed]",
      link: "/wgx/arquivos",
      permitido: permissoes.podeVerDocumentos,
    },
    {
      title: "Financeiro",
      description: "Visualize pagamentos, parcelas e extrato financeiro.",
      icon: <DollarSign className="w-5 h-5 text-white" />,
      color: "from-[#052e16] to-[#166534]",
      link: "/wgx/financeiro",
      permitido: permissoes.podeVerValores,
    },
  ], [permissoes]);

  // Erro
  if (erroCarregamento) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">{erroCarregamento}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                tentativasRef.current = 0;
                jaCarregouRef.current = false;
                setErroCarregamento(null);
                carregarDadosCliente();
              }}
              className="w-full px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1a] transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (permissoes.loading || impersonationLoading || !clienteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26] mb-4"></div>
          <p className="text-gray-600">Carregando suas informações...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isImpersonating && impersonatedUser && (
        <ImpersonationBar
          userName={impersonatedUser.nome}
          userType="CLIENTE"
          onExit={handleExitImpersonation}
        />
      )}

      <div className={`min-h-screen bg-gray-50 ${isImpersonating ? 'pt-16' : ''}`}>
        <div className="pb-16 space-y-8 p-4 md:p-6 lg:p-8">
          {/* Hero Section Premium */}
          <section className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#111827] text-white p-8 md:p-10 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/50 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  {clienteInfo.avatar ? (
                    <img
                      src={clienteInfo.avatar}
                      alt={clienteInfo.nomeCompleto}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-orange-500/30 shadow-2xl ring-4 ring-orange-500/10"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-orange-500/30 shadow-2xl ring-4 ring-orange-500/10">
                      {getIniciais()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">WG EASY · ÁREA DO CLIENTE</p>
                  <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                    {getSaudacao()}, <span className="text-orange-400">{clienteInfo.primeiroNome}</span>
                  </h1>
                  <p className="text-sm text-white/80 max-w-md">
                    Acompanhe o andamento do seu projeto WG Almeida em tempo real.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md min-w-[280px] space-y-4">
                <div className="text-xs uppercase tracking-[0.3em] text-white/70">Progresso geral</div>
                <div className="text-5xl font-semibold">{progressoGeral}%</div>
                <p className="text-sm text-white/80">{stats.etapasConcluidas} de {stats.totalEtapas} etapas concluídas</p>
                <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb7185] transition-all duration-500"
                    style={{ width: `${progressoGeral}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Cards de Acesso Rápido */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Acesso Rápido</h2>
                <p className="text-sm text-gray-500">Navegue pelo seu projeto WG Almeida</p>
              </div>
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {acessoRapidoCards.map((card) => (
                card.permitido ? (
                  <button
                    key={card.title}
                    onClick={() => navigate(card.link)}
                    className={`rounded-2xl border border-gray-100 bg-gradient-to-r ${card.color} text-white p-5 flex items-center justify-between hover:opacity-95 hover:shadow-lg transition-all text-left w-full`}
                  >
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.2em] text-white/70">{card.title}</p>
                      <p className="text-sm text-white/90">{card.description}</p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3 shrink-0 ml-4">{card.icon}</div>
                  </button>
                ) : (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-gray-200 bg-gray-100 text-gray-400 p-5 flex items-center justify-between opacity-50"
                  >
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.2em]">{card.title}</p>
                      <p className="text-sm">Acesso não disponível</p>
                    </div>
                    <div className="rounded-full bg-gray-200 p-3 shrink-0 ml-4">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                )
              ))}
            </div>
          </section>

          {/* KPIs */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl bg-gradient-to-br ${card.accent} text-white p-6 shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">{card.label}</p>
                  <div className="p-2 rounded-full bg-white/10">{card.icon}</div>
                </div>
                <div className="text-2xl md:text-3xl font-semibold truncate">{card.value}</div>
                <p className="mt-1 text-sm text-white/80">{card.trend}</p>
              </div>
            ))}
          </section>

          {/* ============================================================ */}
          {/* SEÇÃO 1: DIÁRIO DE OBRA (Fotos) - PRIORITÁRIO */}
          {/* ============================================================ */}
          <DiarioObra
            clienteId={clienteInfo.pessoaId}
            contratoId={clienteInfo.contratoId || undefined}
            oportunidadeId={clienteInfo.oportunidadeId}
          />

          {/* ============================================================ */}
          {/* SEÇÃO 2: CONTRATO E PAGAMENTOS (Grid lado a lado) */}
          {/* ============================================================ */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Info do Contrato */}
            {clienteInfo.contratoId && permissoes.podeVerContratos && (
              <InfoContratoCliente contratoId={clienteInfo.contratoId} />
            )}

            {/* Controle de Cobranças/Pagamentos */}
            <ControleCobrancas
              clienteId={clienteInfo.pessoaId}
              contratoId={clienteInfo.contratoId || undefined}
            />
          </section>

          {/* ============================================================ */}
          {/* SEÇÃO 3: ITENS CONTRATADOS (Quantitativos) */}
          {/* ============================================================ */}
          {clienteInfo.contratoId && permissoes.podeVerContratos && (
            <ItensContratados
              contratoId={clienteInfo.contratoId}
              mostrarValores={permissoes.podeVerValores}
            />
          )}

          {/* ============================================================ */}
          {/* SEÇÃO 4: ORÇAMENTOS PENDENTES */}
          {/* ============================================================ */}
          <OrcamentosPendentesCliente
            clienteId={clienteInfo.oportunidadeId.replace('CLIENTE-', '')}
            onAprovar={carregarDadosCliente}
          />

          {/* ============================================================ */}
          {/* SEÇÃO 5: COMENTÁRIOS (se permitido) */}
          {/* ============================================================ */}
          {permissoes.podeComentarem && (
            <ComentariosCliente
              clienteId={clienteInfo.pessoaId}
              contratoId={clienteInfo.contratoId || undefined}
              podeComentarem={permissoes.podeComentarem}
            />
          )}


          {/* Footer */}
          <section className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              Dúvidas sobre seu projeto? Entre em contato com seu consultor WG Almeida.
            </p>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </section>

          {/* Player Spotify */}
          <SpotifyPlayer />
          <SpotifyFloatingButton />
        </div>
      </div>
    </>
  );
}
