// Sidebar com suporte a mobile (off-canvas) e seções recolhidas
import { useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import wgMenus, { MenuSection, MenuItem } from "@/config/wg-menus";
import "@/styles/wg-sidebar.css";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import { usePreviewTipoUsuario } from "@/hooks/usePreviewTipoUsuario";
import {
  LayoutDashboard,
  Users,
  BadgeDollarSign,
  FileText,
  ClipboardList,
  Building2,
  Wrench,
  ShoppingCart,
  Coins,
  Settings,
  CalendarCheck,
  Box,
  BarChart3,
  Wallet,
  Store,
  Home,
  LogOut,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  X,
  Scale,
  Truck,
  HardHat,
  Landmark,
  Cog,
  TreeDeciduous
} from "lucide-react";

type SidebarProps = {
  open?: boolean;
  onToggle?: () => void;
};

function sectionIcon(section: string) {
  const size = 16;
  switch (section.toLowerCase()) {
    case "dashboard":
      return <LayoutDashboard size={size} />;
    case "pessoas":
      return <Users size={size} />;
    case "oportunidades":
      return <BadgeDollarSign size={size} />;
    case "comercial":
      return <FileText size={size} />;
    case "arquitetura":
      return <Landmark size={size} />;
    case "engenharia":
      return <Cog size={size} />;
    case "marcenaria":
      return <TreeDeciduous size={size} />;
    case "planejamento":
      return <ClipboardList size={size} />;
    case "cronograma":
      return <CalendarCheck size={size} />;
    case "wg experience":
    case "wgxperience":
      return <CheckSquare size={size} />;
    case "financeiro":
      return <Coins size={size} />;
    case "meu financeiro":
      return <Wallet size={size} />;
    case "deposito wg":
    case "depósito wg":
      return <Box size={size} />;
    case "wg store":
      return <Store size={size} />;
    case "area do cliente":
    case "área do cliente":
      return <Home size={size} />;
    case "onboarding":
      return <BarChart3 size={size} />;
    case "sistema":
      return <Settings size={size} />;
    case "pos vendas":
    case "pós vendas":
      return <Wallet size={size} />;
    case "sessao":
    case "sessão":
      return <LogOut size={size} />;
    case "juridico":
    case "jurídico":
      return <Scale size={size} />;
    case "serviços":
    case "servicos":
      return <Truck size={size} />;
    case "minha área":
    case "minha area":
      return <HardHat size={size} />;
    default:
      return <Circle size={size} />;
  }
}

function itemIcon(section: string) {
  const size = 16;
  switch (section.toLowerCase()) {
    case "pessoas":
      return <Users size={size} />;
    case "oportunidades":
      return <BadgeDollarSign size={size} />;
    case "comercial":
      return <FileText size={size} />;
    case "planejamento":
      return <ClipboardList size={size} />;
    case "cronograma":
      return <CalendarCheck size={size} />;
    case "financeiro":
      return <Coins size={size} />;
    case "compras":
      return <ShoppingCart size={size} />;
    case "sistema":
      return <Settings size={size} />;
    default:
      return <Circle size={size} />;
  }
}

// Mapeamento de seções permitidas por tipo de usuário restrito
// Usuários listados aqui só veem as seções especificadas
const MENU_POR_TIPO: Record<string, string[]> = {
  JURIDICO: ["Jurídico", "Sessão"],
  FINANCEIRO: ["Financeiro", "Sessão"],
  COLABORADOR: ["Minha Área", "Sessão"], // Colaborador só vê sua área exclusiva
  CLIENTE: ["Área do Cliente", "Sessão"], // Cliente só vê sua área exclusiva
};

export default function Sidebar({ open = false, onToggle }: SidebarProps) {
  // começa recolhido por padrão
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { usuario } = useUsuarioLogado();
  const { previewTipo, isPreviewMode } = usePreviewTipoUsuario();
  const navigate = useNavigate();
  const location = useLocation();

  // Filtrar menus baseado no tipo de usuário (ou tipo de preview se ativo)
  const sortedMenus = useMemo(() => {
    // Usar tipo de preview se ativo, senão usar tipo real do usuário
    const tipoUsuario = isPreviewMode ? previewTipo : usuario?.tipo_usuario;

    // Se for tipo restrito (JURIDICO ou FINANCEIRO), filtrar menus
    if (tipoUsuario && MENU_POR_TIPO[tipoUsuario]) {
      const secoesPermitidas = MENU_POR_TIPO[tipoUsuario];
      return wgMenus.filter((section: MenuSection) =>
        secoesPermitidas.includes(section.section)
      );
    }

    // Tipos com acesso total (MASTER, ADMIN, COMERCIAL, etc)
    // Filtrar seções e itens com restrictTo baseado no tipo de usuário
    return wgMenus
      .filter((section) => {
        // Se a seção tem restrictTo, verificar se o usuário tem permissão
        if (section.restrictTo) {
          if (Array.isArray(section.restrictTo)) {
            return tipoUsuario && section.restrictTo.includes(tipoUsuario);
          }
          return tipoUsuario === section.restrictTo;
        }
        return true;
      })
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // Se o item tem restrictTo, verificar se o usuário tem permissão
          if (item.restrictTo) {
            // Suporta string única ou array de strings
            if (Array.isArray(item.restrictTo)) {
              return tipoUsuario && item.restrictTo.includes(tipoUsuario);
            }
            return tipoUsuario === item.restrictTo;
          }
          // Se não tem restrictTo, mostrar para todos
          return true;
        })
      }));
  }, [usuario?.tipo_usuario, previewTipo, isPreviewMode]);

  const toggleSection = (section: string, path?: string, hasItems?: boolean) => {
    // Se a seção tiver um path, navega para ele
    if (path) {
      navigate(path);
      // Em mobile, fecha o menu após navegar
      if (open && onToggle) {
        onToggle();
      }
    }
    // Só expande/recolhe se tiver itens no submenu
    if (hasItems) {
      setOpenSections((prev) => ({
        ...prev,
        [section]: !(prev[section] ?? false),
      }));
    }
  };

  // Verifica se a seção está ativa (baseado no path atual)
  const isSectionActive = (sectionPath?: string) => {
    if (!sectionPath) return false;
    return location.pathname === sectionPath || location.pathname.startsWith(sectionPath + '/');
  };

  return (
    <aside className={`wg-sidebar ${open ? "open" : ""}`}>
      {/* LOGO + CLOSE MOBILE */}
      <div className="wg-sidebar-logo">
        <img
          src="/imagens/logoscomfundotransparente/logogrupoWgAlmeida.png"
          alt="Grupo WG Almeida"
          className="h-28 w-auto"
        />
        <span className="wg-logo-secondary">EASY</span>
        <button
          type="button"
          className="wg-sidebar-close md:hidden"
          onClick={onToggle}
          aria-label="Fechar menu"
          style={{ marginLeft: 'auto' }}
        >
          <X size={18} />
        </button>
      </div>

      {sortedMenus.map((section) => {
        const isOpen = openSections[section.section] ?? false;
        const hasItems = section.items.length > 0;
        return (
          <div key={section.section} className="wg-sidebar-section">
            <button
              type="button"
              className={`wg-sidebar-section-head ${isOpen && hasItems ? 'expanded' : ''} ${section.path && isSectionActive(section.path) ? 'active' : ''}`}
              onClick={() => toggleSection(section.section, section.path, hasItems)}
              aria-expanded={isOpen && hasItems ? "true" : "false"}
            >
              <span className="wg-sidebar-head-left">
                <span className="wg-sidebar-head-icon">
                  {sectionIcon(section.section)}
                </span>
                <span className="wg-sidebar-section-title">
                  {section.section}
                </span>
              </span>
              {hasItems && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>

            {isOpen && hasItems && (
              <div className="wg-sidebar-items">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `wg-sidebar-item ${isActive ? "active" : ""}`
                    }
                    onClick={onToggle}
                  >
                    <span className="wg-sidebar-icon">
                      {item.icon ? <span>{item.icon}</span> : itemIcon(section.section)}
                    </span>
                    <span className="wg-sidebar-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
