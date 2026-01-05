import { useState, useCallback } from 'react';
import { supabaseRaw } from '@/lib/supabaseClient';

// Tipos para o hook useEntities
interface PessoaBase {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipo?: string;
}

interface EntityWithAlias extends PessoaBase {
  nome_razao_social: string;
}

interface Endereco {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  full: string;
}

interface EntityWithEndereco extends EntityWithAlias {
  endereco: Endereco | null;
}

export const useEntities = () => {
    const [loading, setLoading] = useState(false);

    const getEntities = useCallback(async (): Promise<EntityWithAlias[]> => {
        console.log("Fetching all pessoas (clientes)...");
        setLoading(true);
        try {
            const { data, error } = await supabaseRaw
                .from('pessoas')
                .select('id, nome, email, telefone, logradouro, numero, bairro, cidade, estado, tipo')
                .eq('tipo', 'CLIENTE')
                .eq('ativo', true)
                .order('nome', { ascending: true });

            if (error) throw error;

            console.log("Clientes fetched successfully:", data);
            // Adicionar alias nome_razao_social para compatibilidade
            const entitiesWithAlias = (data || []).map((entity: PessoaBase) => ({
                ...entity,
                nome_razao_social: entity.nome
            }));
            return entitiesWithAlias;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error("Error fetching clientes:", errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getEntityById = useCallback(async (id: string): Promise<EntityWithEndereco | null> => {
        if (!id) {
            console.error("getEntityById: ID is required.");
            return null;
        }
        console.log(`Fetching pessoa with ID: ${id}`);
        setLoading(true);
        try {
            const { data, error } = await supabaseRaw
                .from('pessoas')
                .select('id, nome, logradouro, numero, bairro, cidade, estado')
                .eq('id', id)
                .single();

            if (error) throw error;

            console.log("Pessoa fetched by ID successfully:", data);

            // Montar endereço a partir dos campos separados
            const addressParts = [
                data.logradouro,
                data.numero,
                data.bairro,
                data.cidade,
                data.estado
            ].filter(Boolean);

            const entityWithEndereco: EntityWithEndereco = {
                ...data,
                nome_razao_social: data.nome,
                endereco: addressParts.length > 0 ? {
                    logradouro: data.logradouro,
                    numero: data.numero,
                    bairro: data.bairro,
                    cidade: data.cidade,
                    uf: data.estado,
                    full: addressParts.join(', ')
                } : null
            };

            return entityWithEndereco;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error(`Error fetching pessoa with ID ${id}:`, errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, getEntities, getEntityById };
};
