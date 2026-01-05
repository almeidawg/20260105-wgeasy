import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function realizarLogout() {
      try {
        // CRÍTICO: Chamar signOut do Supabase para invalidar a sessão no servidor
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      } finally {
        // Limpar tokens e storage local
        localStorage.clear();
        sessionStorage.clear();

        // Redirecionar para a página inicial após logout
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    }

    realizarLogout();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <h1 className="text-3xl font-oswald font-bold text-gray-900 mb-2">
            Até logo!
          </h1>
          <p className="text-gray-600 font-poppins">
            Você está sendo desconectado...
          </p>
        </div>
      </div>
    </div>
  );
}
