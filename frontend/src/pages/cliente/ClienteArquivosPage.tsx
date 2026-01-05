// src/pages/cliente/ClienteArquivosPage.tsx
// Página de arquivos da área do cliente

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import ClienteArquivos from '@/components/cliente/ClienteArquivos';
import { useImpersonation, ImpersonationBar } from '@/hooks/useImpersonation';

export default function ClienteArquivosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isImpersonating,
    impersonatedUser,
    stopImpersonation,
    canImpersonate,
    loading: impersonationLoading,
  } = useImpersonation();

  const [loading, setLoading] = useState(true);
  const [clienteInfo, setClienteInfo] = useState<{
    clienteNome: string;
    oportunidadeId: string;
    podeUpload: boolean;
  } | null>(null);

  // ID do cliente passado na URL (para acesso master)
  const clienteIdParam = searchParams.get('cliente_id');

  useEffect(() => {
    if (!impersonationLoading) {
      carregarInformacoesCliente();
    }
  }, [impersonationLoading, isImpersonating, clienteIdParam]);

  async function carregarInformacoesCliente() {
    try {
      let pessoaId: string | null = null;

      // Se estiver impersonando, usar o ID do cliente impersonado
      if (isImpersonating && impersonatedUser) {
        pessoaId = impersonatedUser.id;
      } else if (clienteIdParam && canImpersonate) {
        // Master/Admin acessando com cliente_id na URL (aguardando impersonação carregar)
        pessoaId = clienteIdParam;
      } else {
        // Fluxo normal - pegar usuário logado
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // Buscar informações do usuário/cliente
        const { data: usuario, error: erroUsuario } = await supabase
          .from('usuarios')
          .select('pessoa_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (erroUsuario || !usuario) {
          console.error('Erro ao buscar usuário:', erroUsuario);
          return;
        }

        pessoaId = usuario.pessoa_id;
      }

      if (!pessoaId) {
        console.error('Nenhum ID de pessoa encontrado');
        return;
      }

      // Buscar pessoa (cliente)
      const { data: pessoa, error: erroPessoa } = await supabase
        .from('pessoas')
        .select('id, nome, tipo')
        .eq('id', pessoaId)
        .maybeSingle();

      if (erroPessoa || !pessoa) {
        console.error('Erro ao buscar pessoa:', erroPessoa);
        return;
      }

      // Buscar oportunidade/contrato do cliente
      const { data: oportunidade, error: erroOportunidade } = await supabase
        .from('oportunidades')
        .select('id')
        .eq('cliente_id', pessoa.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (erroOportunidade || !oportunidade) {
        console.error('Erro ao buscar oportunidade:', erroOportunidade);
        // Usar ID genérico se não encontrar oportunidade
        setClienteInfo({
          clienteNome: pessoa.nome,
          oportunidadeId: `CLIENTE-${pessoa.id}`,
          podeUpload: true,
        });
      } else {
        setClienteInfo({
          clienteNome: pessoa.nome,
          oportunidadeId: oportunidade.id,
          podeUpload: true, // Cliente sempre pode fazer upload
        });
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || impersonationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!clienteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar informações do cliente</p>
          <Button onClick={() => navigate('/area-cliente')}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // URL de voltar (preservando cliente_id se impersonando)
  const voltarUrl = isImpersonating && clienteIdParam
    ? `/area-cliente?cliente_id=${clienteIdParam}`
    : '/area-cliente';

  return (
    <>
      {/* Barra de impersonação */}
      {isImpersonating && impersonatedUser && (
        <ImpersonationBar
          userName={impersonatedUser.nome}
          userType="CLIENTE"
          onExit={stopImpersonation}
        />
      )}

      <div className={`max-w-7xl mx-auto p-6 space-y-6 ${isImpersonating ? "pt-20" : ""}`}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(voltarUrl)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-oswald font-bold text-gray-900">
              {isImpersonating ? `Arquivos de ${impersonatedUser?.nome}` : 'Meus Arquivos'}
            </h1>
            <p className="text-sm text-gray-600">
              Visualize e envie arquivos do seu projeto
            </p>
          </div>
        </div>

        {/* Componente de Arquivos */}
        <ClienteArquivos
          clienteNome={clienteInfo.clienteNome}
          oportunidadeId={clienteInfo.oportunidadeId}
          podeUpload={clienteInfo.podeUpload}
        />
      </div>
    </>
  );
}
