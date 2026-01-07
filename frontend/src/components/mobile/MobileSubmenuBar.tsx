import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

export default function MobileSubmenuBar() {
  const location = useLocation();
  const { usuario } = useUsuarioLogado();

  const activeSection = useMemo(() => {
    const tipoUsuario = usuario?.tipo_usuario;
    const allowedSections = tipoUsuario ? MENU_POR_TIPO[tipoUsuario] : null;

    const menus = allowedSections
      ? wgMenus.filter((section: MenuSection) =>
          allowedSections.includes(normalizeSection(section.section))
        )
      : wgMenus;

    const path = location.pathname;
    return menus.find((section) => {
      if (section.path && (path === section.path || path.startsWith(section.path + "/"))) {
        return true;
      }
      return section.items.some((item) =>
        path === item.path || path.startsWith(item.path + "/")
      );
    });
  }, [location.pathname, usuario?.tipo_usuario]);

  if (!activeSection || activeSection.items.length === 0) {
    return null;
  }

  return (
    <nav className="mobile-submenu-bar">
      <div className="mobile-submenu-scroll">
        {activeSection.items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `mobile-submenu-item ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
