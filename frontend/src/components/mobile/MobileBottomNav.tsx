// ============================================================
// MobileBottomNav - Navegacao inferior para dispositivos moveis
// Sistema WG Easy - Grupo WG Almeida
// Menu horizontal com rolagem + Drawer de submenus
// ============================================================

import { useMemo, useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BadgeDollarSign,
  FileText,
  ClipboardList,
  FolderKanban,
  CalendarCheck,
  Coins,
  Scale,
  Truck,
  Circle,
  X,
  ChevronRight,
  Star,
  Settings,
  ShoppingCart,
  Package,
  Rocket,
  Wrench,
  Wallet,
  Home,
  HardHat,
  Landmark,
  Cog,
  TreeDeciduous
} from "lucide-react";
import wgMenus, { MenuSection, MenuItem } from "@/config/wg-menus";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";

// Menus permitidos por tipo de usuario
// Se o tipo estiver aqui, so vera essas secoes
// Se nao estiver, vera todas as secoes (acesso completo)
const MENU_POR_TIPO: Record<string, string[]> = {
  JURIDICO: ["juridico", "sessao"],
  FINANCEIRO: ["financeiro", "sessao"],
  COLABORADOR: ["minha area", "sessao"], // Colaborador so ve sua area exclusiva
  CLIENTE: ["area do cliente", "sessao"], // Cliente so ve sua area exclusiva
};

function normalizeSection(section: string) {
  return section
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sectionIcon(section: string, size = 18) {
  const sectionLower = normalizeSection(section);

  switch (sectionLower) {
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
    case "financeiro":
      return <Coins size={size} />;
    case "juridico":
      return <Scale size={size} />;
    case "servicos":
      return <Truck size={size} />;
    case "wgxperience":
      return <Star size={size} />;
    case "pos vendas":
      return <Wrench size={size} />;
    case "onboarding":
      return <Rocket size={size} />;
    case "wg store":
      return <ShoppingCart size={size} />;
    case "deposito wg":
      return <Package size={size} />;
    case "sistema":
      return <Settings size={size} />;
    case "meu financeiro":
      return <Wallet size={size} />;
    case "area do cliente":
      return <Home size={size} />;
    case "minha area":
      return <HardHat size={size} />; // Area do colaborador
    default:
      return <Circle size={size} />;
  }
}

// Icone para item individual do submenu
function itemIcon(label: string, size = 20) {
  const labelLower = label.toLowerCase();

  if (labelLower.includes("cliente")) return <Users size={size} />;
  if (labelLower.includes("colaborador")) return <Users size={size} />;
  if (labelLower.includes("fornecedor")) return <Truck size={size} />;
  if (labelLower.includes("especificador")) return <Users size={size} />;
  if (labelLower.includes("proposta")) return <FileText size={size} />;
  if (labelLower.includes("contrato")) return <FileText size={size} />;
  if (labelLower.includes("projeto")) return <FolderKanban size={size} />;
  if (labelLower.includes("lancamento")) return <Coins size={size} />;
  if (labelLower.includes("compra")) return <ShoppingCart size={size} />;
  if (labelLower.includes("orcamento")) return <FileText size={size} />;
  if (labelLower.includes("usuario")) return <Users size={size} />;

  return <ChevronRight size={size} />;
}

interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
  exact: boolean;
  items: MenuItem[];
  sectionPath?: string;
}

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useUsuarioLogado();

  // Estado do drawer de submenus
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<NavItem | null>(null);

  const navItems = useMemo(() => {
    const tipoUsuario = usuario?.tipo_usuario;
    const allowedSections = tipoUsuario ? MENU_POR_TIPO[tipoUsuario] : null;

    const menus = allowedSections
      ? wgMenus.filter((section: MenuSection) =>
          allowedSections.includes(normalizeSection(section.section))
        )
      : wgMenus.filter((section: MenuSection) => {
          // Filtrar seções por restrictTo
          if (section.restrictTo) {
            if (Array.isArray(section.restrictTo)) {
              return tipoUsuario && section.restrictTo.includes(tipoUsuario);
            }
            return tipoUsuario === section.restrictTo;
          }
          return true;
        });

    return menus
      .map((section) => {
        const path = section.path || section.items[0]?.path;
        if (!path || path === "/logout") {
          return null;
        }

        // Filtrar itens por restrictTo
        const filteredItems = section.items.filter((item) => {
          if (!item.restrictTo) return true;
          if (Array.isArray(item.restrictTo)) {
            return tipoUsuario && item.restrictTo.includes(tipoUsuario);
          }
          return tipoUsuario === item.restrictTo;
        });

        return {
          path,
          label: section.section,
          icon: sectionIcon(section.section),
          exact: path === "/",
          items: filteredItems,
          sectionPath: section.path,
        };
      })
      .filter(Boolean) as NavItem[];
  }, [usuario?.tipo_usuario]);

  const isActive = useCallback((item: NavItem) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    // Verificar se esta na secao ou em algum subitem
    if (location.pathname.startsWith(item.path)) return true;
    return item.items.some((subitem) => location.pathname.startsWith(subitem.path));
  }, [location.pathname]);

  // Handler para clique no item do menu
  const handleNavClick = useCallback((e: React.MouseEvent, item: NavItem) => {
    // Se tem subitens, abre o drawer em vez de navegar
    if (item.items.length > 0) {
      e.preventDefault();
      setActiveSection(item);
      setDrawerOpen(true);
    }
    // Se nao tem subitens, navega normalmente (NavLink cuida disso)
  }, []);

  // Handler para clique em subitem
  const handleSubItemClick = useCallback((path: string) => {
    navigate(path);
    setDrawerOpen(false);
    setActiveSection(null);
  }, [navigate]);

  // Fechar drawer
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveSection(null);
  }, []);

  return (
    <>
      {/* Menu principal inferior */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const active = isActive(item);
          const hasSubitems = item.items.length > 0;

          return (
            <NavLink
              key={item.path}
              to={hasSubitems ? "#" : item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`mobile-nav-item ${active ? "active" : ""} ${hasSubitems ? "has-subitems" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Overlay do Drawer */}
      {drawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer de Submenus */}
      {drawerOpen && activeSection && (
        <div className="mobile-drawer">
          {/* Handle de arraste */}
          <div className="mobile-drawer-handle">
            <div className="mobile-drawer-handle-bar" />
          </div>

          {/* Header do drawer */}
          <div className="mobile-drawer-header">
            <h2>{activeSection.label}</h2>
            <button
              type="button"
              className="mobile-drawer-close"
              onClick={closeDrawer}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Conteudo do drawer */}
          <div className="mobile-drawer-content">
            {/* Link para pagina principal da secao (se existir) */}
            {activeSection.sectionPath && (
              <div className="mobile-drawer-section">
                <div className="mobile-drawer-items">
                  <button
                    type="button"
                    onClick={() => handleSubItemClick(activeSection.sectionPath!)}
                    className={`mobile-drawer-item ${
                      location.pathname === activeSection.sectionPath ? "active" : ""
                    }`}
                  >
                    {sectionIcon(activeSection.label, 20)}
                    <span>Dashboard {activeSection.label}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Subitens */}
            {activeSection.items.length > 0 && (
              <div className="mobile-drawer-section">
                <div className="mobile-drawer-section-title">
                  Acessar
                </div>
                <div className="mobile-drawer-items">
                  {activeSection.items.map((subitem) => (
                    <button
                      key={subitem.path}
                      type="button"
                      onClick={() => handleSubItemClick(subitem.path)}
                      className={`mobile-drawer-item ${
                        location.pathname === subitem.path ||
                        location.pathname.startsWith(subitem.path + "/")
                          ? "active"
                          : ""
                      }`}
                    >
                      {itemIcon(subitem.label)}
                      <span>{subitem.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
