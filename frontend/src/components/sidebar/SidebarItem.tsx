import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

export default function SidebarItem({ icon, label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `wg-sidebar-item ${isActive ? "active" : ""}`
      }
    >
      <span className="wg-sidebar-icon">{icon}</span>
      <span className="wg-sidebar-label">{label}</span>
    </NavLink>
  );
}
