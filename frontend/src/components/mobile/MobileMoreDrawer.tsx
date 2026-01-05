// ============================================================
// MobileMoreDrawer - Sheet/Drawer com mais opções do menu
// Sistema WG Easy - Grupo WG Almeida
// Abre de baixo para cima (bottom sheet)
// CORRIGIDO: Usa wgMenus completo igual ao Sidebar
// ATUALIZADO: Submenus recolhidos por padrão (collapsible)
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Users,
  BadgeDollarSign,
  FileText,
  ClipboardList,
  FolderKanban,
  Building2,
  CalendarCheck,
  CheckSquare,
  Coins,
  Box,
  Store,
  Home,
  BarChart3,
  Settings,
  Wallet,
  LogOut,
  Scale,
  ShoppingCart,
  Wrench,
  Circle,
  Target,
  Truck,
  CreditCard,
} from "lucide-react";
import wgMenus, { MenuSection } from "@/config/wg-menus";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";

interface MobileMoreDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Mapeamento de seções permitidas por tipo de usuário restrito
// JURIDICO e FINANCEIRO só veem seu módulo específico
const MENU_POR_TIPO: Record<string, string[]> = {
  JURIDICO: ["Jurídico", "Sessão"],
  FINANCEIRO: ["Financeiro", "Sessão"],
};

// Função para obter ícone da seção
function getSectionIcon(section: string) {
  const size = 18;
  const sectionLower = section.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  switch (sectionLower) {
    case "dashboard":
      return <LayoutDashboard size={size} />;
    case "meu financeiro":
      return <CreditCard size={size} />;
    case "pessoas":
      return <Users size={size} />;
    case "oportunidades":
      return <Target size={size} />;
    case "comercial":
      return <FileText size={size} />;
    case "nucleos":
      return <FolderKanban size={size} />;
    case "planejamento":
      return <ClipboardList size={size} />;
    case "servicos":
      return <Truck size={size} />;
    case "cronograma":
      return <CalendarCheck size={size} />;
    case "wg experience":
    case "area wgxperience":
      return <CheckSquare size={size} />;
    case "financeiro":
      return <Coins size={size} />;
    case "deposito wg":
      return <Box size={size} />;
    case "wg store":
      return <Store size={size} />;
    case "area do cliente":
      return <Home size={size} />;
    case "onboarding":
      return <BarChart3 size={size} />;
    case "sistema":
      return <Settings size={size} />;
    case "pos vendas":
      return <Wallet size={size} />;
    case "sessao":
      return <LogOut size={size} />;
    case "juridico":
      return <Scale size={size} />;
    default:
      return <Circle size={size} />;
  }
}

// Função para obter ícone do item
function getItemIcon(label: string, section: string) {
  const size = 18;
  const labelLower = label.toLowerCase();

  // Ícones específicos por label
  if (labelLower.includes("compra")) return <ShoppingCart size={size} />;
  if (labelLower.includes("assistência") || labelLower.includes("assistencia")) return <Wrench size={size} />;

  // Fallback para ícone da seção
  return getSectionIcon(section);
}

export default function MobileMoreDrawer({ open, onClose }: MobileMoreDrawerProps) {
  const { usuario } = useUsuarioLogado();

  // Estado para controlar quais seções estão expandidas (todas recolhidas por padrão)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Filtrar menus baseado no tipo de usuário (mesma lógica do Sidebar)
  const filteredMenus = useMemo(() => {
    const tipoUsuario = usuario?.tipo_usuario;

    // Se for tipo restrito (JURIDICO ou FINANCEIRO), filtrar menus
    if (tipoUsuario && MENU_POR_TIPO[tipoUsuario]) {
      const secoesPermitidas = MENU_POR_TIPO[tipoUsuario];
      return wgMenus.filter((section: MenuSection) =>
        secoesPermitidas.includes(section.section)
      );
    }

    // Tipos com acesso total (MASTER, ADMIN, COMERCIAL, etc)
    // Excluir Dashboard pois já está na barra inferior
    return wgMenus.filter((section: MenuSection) =>
      section.section !== "Dashboard"
    );
  }, [usuario?.tipo_usuario]);

  // Toggle expansão de uma seção
  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  // Reset quando fechar
  useEffect(() => {
    if (!open) {
      setExpandedSections(new Set());
    }
  }, [open]);

  // Bloquear scroll quando aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="mobile-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="mobile-drawer">
        {/* Handle bar */}
        <div className="mobile-drawer-handle">
          <div className="mobile-drawer-handle-bar" />
        </div>

        {/* Header */}
        <div className="mobile-drawer-header">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-wg-primary" />
            <h2 className="font-oswald text-lg font-bold text-gray-900">
              Menu Completo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mobile-drawer-close"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mobile-drawer-content">
          {filteredMenus.map((section) => {
            // Seções com path direto e sem items (ex: Oportunidades, Serviços, Depósito)
            const hasDirectPath = section.path && section.items.length === 0;
            const isLogoutSection = section.path === "/logout";
            const isExpanded = expandedSections.has(section.section);

            return (
              <div key={section.section} className="mobile-drawer-section">
                {hasDirectPath ? (
                  // Seção clicável direta (sem subitems)
                  <NavLink
                    to={section.path!}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `mobile-drawer-item ${isActive ? "active" : ""} ${isLogoutSection ? "text-red-500" : ""}`
                    }
                  >
                    {getSectionIcon(section.section)}
                    <span className="flex-1 font-medium">{section.section}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </NavLink>
                ) : (
                  // Seção com subitems (collapsible)
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.section)}
                      className="mobile-drawer-section-title w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="flex items-center gap-2 text-gray-700 font-medium">
                        {getSectionIcon(section.section)}
                        {section.section}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mobile-drawer-items mt-1 ml-2 border-l-2 border-gray-100 pl-3 space-y-0.5">
                        {section.items.map((item) => {
                          const isLogout = item.path === "/logout";
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `mobile-drawer-item ${isActive ? "active" : ""} ${isLogout ? "text-red-500" : ""}`
                              }
                            >
                              {getItemIcon(item.label, section.section)}
                              <span className="flex-1">{item.label}</span>
                              <ChevronRight size={16} className="text-gray-400" />
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
