// ============================================================
// MobileBottomNav - Navegacao inferior para dispositivos moveis
// Sistema WG Easy - Grupo WG Almeida
// Menu horizontal com rolagem
// ============================================================

import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";
import wgMenus, { MenuSection } from "@/config/wg-menus";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";

const MENU_POR_TIPO: Record<string, string[]> = {
  JURIDICO: ["juridico", "sessao"],
  FINANCEIRO: ["financeiro", "sessao"],
};

function normalizeSection(section: string) {
  return section
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sectionIcon(section: string) {
  const size = 18;
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
    case "nucleos":
      return <FolderKanban size={size} />;
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
    default:
      return <Circle size={size} />;
  }
}

export default function MobileBottomNav() {
  const location = useLocation();
  const { usuario } = useUsuarioLogado();

  const navItems = useMemo(() => {
    const tipoUsuario = usuario?.tipo_usuario;
    const allowedSections = tipoUsuario ? MENU_POR_TIPO[tipoUsuario] : null;

    const menus = allowedSections
      ? wgMenus.filter((section: MenuSection) =>
          allowedSections.includes(normalizeSection(section.section))
        )
      : wgMenus;

    return menus
      .map((section) => {
        const path = section.path || section.items[0]?.path;
        if (!path || path === "/logout") {
          return null;
        }
        return {
          path,
          label: section.section,
          icon: sectionIcon(section.section),
          exact: path === "/",
        };
      })
      .filter(Boolean) as Array<{
      path: string;
      label: string;
      icon: JSX.Element;
      exact: boolean;
    }>;
  }, [usuario?.tipo_usuario]);

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const active = isActive(item);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${active ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
