// ============================================================
// MobileBottomNav - Navegação inferior para dispositivos móveis
// Sistema WG Easy - Grupo WG Almeida
// Padrão iOS/Android com safe area e haptic feedback
// ============================================================

import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  MoreHorizontal,
} from "lucide-react";

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const NAV_ITEMS = [
  {
    path: "/",
    label: "Painel",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: "/pessoas/clientes",
    label: "CRM",
    icon: Users,
    matchPaths: ["/pessoas", "/oportunidades"],
  },
  {
    path: "/cronograma",
    label: "Obras",
    icon: Building2,
    matchPaths: ["/cronograma", "/contratos"],
  },
  {
    path: "/planejamento/orcamentos",
    label: "Orçamentos",
    icon: FileText,
    matchPaths: ["/planejamento", "/orcamentos", "/quantitativos"],
  },
];

export default function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const location = useLocation();

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    if (item.matchPaths) {
      return item.matchPaths.some((p) => location.pathname.startsWith(p));
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="mobile-bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${active ? "active" : ""}`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {/* Botão Mais */}
      <button
        type="button"
        onClick={onMoreClick}
        className="mobile-nav-item"
        aria-label="Mais opções"
      >
        <MoreHorizontal size={20} strokeWidth={2} />
        <span>Mais</span>
      </button>
    </nav>
  );
}
