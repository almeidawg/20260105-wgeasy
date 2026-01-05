import { Outlet } from "react-router-dom";
import "@/styles/Layout.css";

export default function RootLayout() {
  return (
    <div className="wg-layout">
      <Outlet />
    </div>
  );
}
