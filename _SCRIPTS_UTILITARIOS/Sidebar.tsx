import React from "react";
import { NavLink } from "react-router-dom";
import "@/styles/wg-sidebar.css";

export default function Sidebar() {
  const items = [
    { label: "Dashboard", to: "/" },
    { label: "Contratos", to: "/contratos" },
    { label: "Propostas", to: "/propostas" },
    { label: "Financeiro", to: "/financeiro" },
    { label: "Compras", to: "/compras" },
  ];

  return (
    <aside className="sidebar-wg">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? "item bg-white/10 text-white" : "item"
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
