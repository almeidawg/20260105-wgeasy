import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// Função para registrar acesso ao sistema (desativada para evitar 400 por RLS)
async function registrarAcessoSistema(_user: User) {
  // TODO: reativar quando houver policies RLS adequadas para update/insert
  return;
}

interface UsuarioCompleto {
  id: string;
  nome: string;
  email: string;
  pessoa_id?: string | null;
  tipo: string;
  avatar_url?: string;
  cargo?: string;
  empresa?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  usuarioCompleto: UsuarioCompleto | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioCompleto, setUsuarioCompleto] =
    useState<UsuarioCompleto | null>(null);
  const testSessionApplied = useRef(false);

  const TEST_SESSION_KEY = "sb-test-auth-token";

  async function aplicarSessaoDeTeste() {
    if (testSessionApplied.current) return;
    try {
      const raw = localStorage.getItem(TEST_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        access_token?: string;
        refresh_token?: string;
      };
      if (parsed?.access_token && parsed?.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        if (!error && data?.session) {
          testSessionApplied.current = true;
          console.log("[Auth] Sessão de teste aplicada");
        }
      }
    } catch (err) {
      console.warn("[Auth] Falha ao aplicar sessão de teste", err);
    }
  }

  // Função de logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsuarioCompleto(null);
  };

  // Carregar dados completos do usuário
  const carregarUsuarioCompleto = async (authUser: User) => {
    try {
      const { data: pessoa } = await supabase
        .from("pessoas")
        .select("id, nome, email, tipo, avatar_url, cargo, empresa")
        .eq("email", authUser.email)
        .maybeSingle();

      if (pessoa) {
        setUsuarioCompleto({
          id: pessoa.id,
          pessoa_id: pessoa.id,
          nome: pessoa.nome,
          email: pessoa.email,
          tipo: pessoa.tipo,
          avatar_url: pessoa.avatar_url,
          cargo: pessoa.cargo,
          empresa: pessoa.empresa,
        });
      }
    } catch (err) {
      console.warn("[Auth] Erro ao carregar dados completos do usuário:", err);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        await aplicarSessaoDeTeste();

        // Primeiro, verifica se há um hash na URL (retorno do OAuth)
        const hashParams = window.location.hash;
        if (hashParams && hashParams.includes("access_token")) {
          console.log("[Auth] Detectado retorno OAuth, processando...");
          // O Supabase vai processar automaticamente o hash com detectSessionInUrl: true
          // Limpa o hash da URL após processar
          setTimeout(() => {
            window.history.replaceState(null, "", window.location.pathname);
          }, 100);
        }

        // Aguarda um pouco para o Supabase processar o hash
        await new Promise((resolve) => setTimeout(resolve, 200));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] Erro ao carregar sessão:", error);
        }

        setUser(data.session?.user || null);

        if (data.session?.user) {
          console.log("[Auth] Usuário autenticado:", data.session.user.email);
          await carregarUsuarioCompleto(data.session.user);
        }
      } catch (err) {
        console.error("[Auth] Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] Estado alterado:", event, session?.user?.email);
        setUser(session?.user || null);

        // Se for um login via OAuth, redireciona para a home
        if (event === "SIGNED_IN" && session?.user) {
          // Remove o hash da URL se existir
          if (window.location.hash) {
            window.history.replaceState(
              null,
              "",
              window.location.pathname || "/"
            );
          }

          // Registrar notificação de acesso ao sistema
          registrarAcessoSistema(session.user);

          // Carregar dados completos do usuário
          carregarUsuarioCompleto(session.user);
        }

        // Limpar dados ao fazer logout
        if (event === "SIGNED_OUT") {
          setUsuarioCompleto(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, usuarioCompleto }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
