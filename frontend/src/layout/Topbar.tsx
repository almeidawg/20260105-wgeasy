import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import NotificationBell from "@/components/layout/NotificationBell";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import { TIPOS_USUARIO } from "@/lib/permissoesModuloApi";
import { buscarTituloRegistro } from "@/services/tabTitleService";

// Interface e constantes para tabs
interface Tab {
  title: string;
  path: string;
  loading?: boolean;
}

const titulosFallback: Record<string, string> = {
  "pessoas/clientes": "Cliente",
  "pessoas/colaboradores": "Colaborador",
  "pessoas/fornecedores": "Fornecedor",
  "pessoas/especificadores": "Especificador",
  "contratos": "Contrato",
  "cronograma/projects": "Projeto",
  "cronograma/projeto": "Projeto",
  "orcamentos": "Orçamento",
  "compras": "Compra",
  "assistencia": "Assistência",
  "usuarios": "Usuário",
  "tarefas": "Tarefa",
  "obras": "Obra",
};

// Limite de tabs visíveis (para não encostar no sino)
const MAX_TABS_VISIBLE = 8;

export default function Topbar() {
  const { user } = useAuth();
  const { usuario } = useUsuarioLogado();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Estado das tabs
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [active, setActive] = useState("");

  // Estado para erro de carregamento do avatar
  const [avatarError, setAvatarError] = useState(false);

  // Resetar erro quando a URL do avatar mudar
  const avatarUrl = usuario?.avatar_url;
  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  // Usar nome do usuário logado se disponível
  const nome = useMemo(() => {
    if (usuario?.nome) return usuario.nome;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email;
    return "Usuário";
  }, [user, usuario]);

  const iniciais = useMemo(() => {
    const parts = nome.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [nome]);

  // Label do tipo de usuário para exibição
  const tipoUsuarioLabel = useMemo(() => {
    if (!usuario?.tipo_usuario) return null;
    const tipo = TIPOS_USUARIO.find(t => t.value === usuario.tipo_usuario);
    return tipo?.label || usuario.tipo_usuario;
  }, [usuario?.tipo_usuario]);

  // ========== FUNÇÕES DE TABS ==========

  // Função para gerar título inicial (síncrono)
  const gerarTituloInicial = useCallback((path: string): { titulo: string; rotaBase: string | null; uuid: string | null } => {
    const parts = path.split("/").filter(Boolean);

    if (parts.length === 0) {
      return { titulo: "Dashboard", rotaBase: null, uuid: null };
    }

    const lastPart = parts[parts.length - 1];
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastPart);

    if (isUUID && parts.length >= 2) {
      const rotaBase = parts.slice(0, -1).join("/");
      const tituloFallback = titulosFallback[rotaBase];

      if (tituloFallback) {
        return { titulo: tituloFallback, rotaBase, uuid: lastPart };
      }

      const penultimaParte = parts[parts.length - 2];
      return {
        titulo: penultimaParte.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        rotaBase,
        uuid: lastPart,
      };
    }

    return {
      titulo: lastPart.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      rotaBase: null,
      uuid: null,
    };
  }, []);

  // Função para atualizar título de uma aba específica
  const atualizarTitulo = useCallback((path: string, novoTitulo: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.path === path ? { ...tab, title: novoTitulo, loading: false } : tab
      )
    );
  }, []);

  // Buscar título real do registro
  const buscarTituloReal = useCallback(
    async (path: string, rotaBase: string, uuid: string) => {
      try {
        const nomeReal = await buscarTituloRegistro(rotaBase, uuid);
        atualizarTitulo(path, nomeReal);
      } catch (error) {
        console.warn("[Topbar] Erro ao buscar título:", error);
      }
    },
    [atualizarTitulo]
  );

  // Gerenciar tabs quando a rota muda
  useEffect(() => {
    const current = location.pathname;

    setTabs((prev) => {
      if (prev.some((t) => t.path === current)) {
        return prev;
      }

      const { titulo, rotaBase, uuid } = gerarTituloInicial(current);

      // Se ultrapassar o limite, remover a mais antiga
      let novaLista = [...prev];
      if (novaLista.length >= MAX_TABS_VISIBLE) {
        novaLista = novaLista.slice(1); // Remove a primeira (mais antiga)
      }

      if (rotaBase && uuid) {
        setTimeout(() => buscarTituloReal(current, rotaBase, uuid), 0);
        return [...novaLista, { title: titulo, path: current, loading: true }];
      }

      return [...novaLista, { title: titulo, path: current }];
    });

    setActive(current);
  }, [location.pathname, gerarTituloInicial, buscarTituloReal]);

  function fecharAba(path: string) {
    const novaLista = tabs.filter((t) => t.path !== path);
    setTabs(novaLista);

    if (path === active && novaLista.length > 0) {
      navigate(novaLista[novaLista.length - 1].path);
    } else if (novaLista.length === 0) {
      navigate("/");
    }
  }

  function fecharTodas() {
    setTabs([]);
    navigate("/");
  }

  // ========== FIM FUNÇÕES DE TABS ==========

  async function handleSignOut() {
    setOpen(false);
    await supabase.auth.signOut();
    navigate("/login");
  }

  function handleUserClick() {
    if (!user) {
      navigate("/login");
    } else {
      setOpen((v) => !v);
    }
  }

  return (
    <header className="topbar">
      {/* LINHA ÚNICA: Tabs + Fechar tudo + Sino + Avatar + Nome */}
      <div className="topbar-single-row hidden md:flex">
        {/* Tabs à esquerda */}
        <div className="wg-tabs-scroll flex gap-1 overflow-x-auto flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`wg-tab-item ${tab.path === active ? "wg-tab-active" : ""}`}
            >
              <span className={tab.loading ? "wg-tab-loading" : ""}>
                {tab.title}
              </span>
              <button
                type="button"
                className="wg-tab-close"
                title={`Fechar ${tab.title}`}
                aria-label={`Fechar ${tab.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  fecharAba(tab.path);
                }}
              >
                <X size={8} />
              </button>
            </div>
          ))}
        </div>

        {/* Fechar tudo */}
        {tabs.length > 0 && (
          <button
            type="button"
            onClick={fecharTodas}
            className="text-[9px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 mr-3"
          >
            Fechar tudo
          </button>
        )}

        {/* Sino de notificações */}
        {user && <NotificationBell />}

        {/* Avatar + Nome + Função */}
        <div className="relative ml-3">
          <button
            type="button"
            onClick={handleUserClick}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {user ? (
              avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt={nome}
                  className="w-7 h-7 rounded-full object-cover border-2 border-orange-500/30 shadow-sm"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-xs font-bold border-2 border-orange-500/30 shadow-sm">
                  {iniciais}
                </div>
              )
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <UserIcon size={12} className="text-gray-500" />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{user ? nome : "Entrar"}</span>
              {user && tipoUsuarioLabel && (
                <span className="text-xs text-gray-500 font-medium">
                  {tipoUsuarioLabel}
                </span>
              )}
            </div>
          </button>

          {open && user && (
            <div className="user-menu">
              <div className="user-email">{user.email}</div>
              <button
                type="button"
                onClick={handleSignOut}
                className="user-menu-item"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: apenas avatar e sino */}
      <div className="topbar-mobile-row flex md:hidden items-center justify-end gap-3 px-4 py-2">
        {user && <NotificationBell />}
        <div className="relative">
          <button
            type="button"
            onClick={handleUserClick}
            className="flex items-center gap-2"
          >
            {user ? (
              avatarUrl && !avatarError ? (
                <img
                  src={avatarUrl}
                  alt={nome}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  {iniciais}
                </div>
              )
            ) : (
              <UserIcon size={20} className="text-gray-500" />
            )}
          </button>
          {open && user && (
            <div className="user-menu">
              <div className="user-email">{user.email}</div>
              <button type="button" onClick={handleSignOut} className="user-menu-item">
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
