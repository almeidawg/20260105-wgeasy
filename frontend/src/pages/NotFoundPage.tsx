import { Link } from "react-router-dom";
import "@/styles/notfound.css";

export default function NotFoundPage() {
  return (
    <div className="notfound-container">
      <h1>Erro 404</h1>
      <p>A página que você tentou acessar não existe.</p>
      <Link to="/dashboard" className="btn-voltar">
        Voltar ao painel
      </Link>
    </div>
  );
}
