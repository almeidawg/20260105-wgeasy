export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acessos_cliente: {
        Row: {
          cliente_id: string
          criado_em: string | null
          dispositivo: string | null
          id: string
          ip_acesso: string | null
          usuario_id: string | null
        }
        Insert: {
          cliente_id: string
          criado_em?: string | null
          dispositivo?: string | null
          id?: string
          ip_acesso?: string | null
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string
          criado_em?: string | null
          dispositivo?: string | null
          id?: string
          ip_acesso?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "acessos_cliente_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acessos_cliente_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      ambientes: {
        Row: {
          area_m2: number | null
          atualizado_em: string | null
          criado_em: string | null
          id: string
          nome: string
          obra_id: string | null
          pavimento: string | null
          pe_direito_m: number | null
          perimetro_ml: number | null
          uso: string | null
        }
        Insert: {
          area_m2?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome: string
          obra_id?: string | null
          pavimento?: string | null
          pe_direito_m?: number | null
          perimetro_ml?: number | null
          uso?: string | null
        }
        Update: {
          area_m2?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          nome?: string
          obra_id?: string | null
          pavimento?: string | null
          pe_direito_m?: number | null
          perimetro_ml?: number | null
          uso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambientes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambientes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      ambientes_itens: {
        Row: {
          ambiente_id: string
          categoria: string | null
          criado_em: string | null
          id: string
          item: string
          origem: string | null
          quantidade: number
          unidade: string
        }
        Insert: {
          ambiente_id: string
          categoria?: string | null
          criado_em?: string | null
          id?: string
          item: string
          origem?: string | null
          quantidade: number
          unidade: string
        }
        Update: {
          ambiente_id?: string
          categoria?: string | null
          criado_em?: string | null
          id?: string
          item?: string
          origem?: string | null
          quantidade?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambientes_itens_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "ambientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ambientes_quantitativos: {
        Row: {
          ambiente_id: string
          criado_em: string | null
          descricao: string | null
          id: string
          origem: string | null
          quantidade: number
          tipo: string
          unidade: string
        }
        Insert: {
          ambiente_id: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          origem?: string | null
          quantidade: number
          tipo: string
          unidade: string
        }
        Update: {
          ambiente_id?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          origem?: string | null
          quantidade?: number
          tipo?: string
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambientes_quantitativos_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "ambientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ambientes_templates: {
        Row: {
          ativo: boolean | null
          categorias_padrao: Json | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categorias_padrao?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categorias_padrao?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analises_projeto: {
        Row: {
          analise_ia: Json | null
          area_total: number | null
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_id: string | null
          confiabilidade_analise: number | null
          contrato_texto: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          endereco_obra: string | null
          id: string
          memorial_descritivo: string | null
          modelo_ia: string | null
          numero: string | null
          oportunidade_id: string | null
          padrao_construtivo: string | null
          pe_direito_padrao: number | null
          plantas_urls: Json | null
          prompt_utilizado: string | null
          proposta_id: string | null
          provedor_ia: string | null
          status: string | null
          tempo_processamento_ms: number | null
          tipo_imovel: string | null
          tipo_projeto: string | null
          titulo: string
          total_ambientes: number | null
          total_area_paredes: number | null
          total_area_piso: number | null
          total_perimetro: number | null
          total_servicos: number | null
        }
        Insert: {
          analise_ia?: Json | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_id?: string | null
          confiabilidade_analise?: number | null
          contrato_texto?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          id?: string
          memorial_descritivo?: string | null
          modelo_ia?: string | null
          numero?: string | null
          oportunidade_id?: string | null
          padrao_construtivo?: string | null
          pe_direito_padrao?: number | null
          plantas_urls?: Json | null
          prompt_utilizado?: string | null
          proposta_id?: string | null
          provedor_ia?: string | null
          status?: string | null
          tempo_processamento_ms?: number | null
          tipo_imovel?: string | null
          tipo_projeto?: string | null
          titulo: string
          total_ambientes?: number | null
          total_area_paredes?: number | null
          total_area_piso?: number | null
          total_perimetro?: number | null
          total_servicos?: number | null
        }
        Update: {
          analise_ia?: Json | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_id?: string | null
          confiabilidade_analise?: number | null
          contrato_texto?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          id?: string
          memorial_descritivo?: string | null
          modelo_ia?: string | null
          numero?: string | null
          oportunidade_id?: string | null
          padrao_construtivo?: string | null
          pe_direito_padrao?: number | null
          plantas_urls?: Json | null
          prompt_utilizado?: string | null
          proposta_id?: string | null
          provedor_ia?: string | null
          status?: string | null
          tempo_processamento_ms?: number | null
          tipo_imovel?: string | null
          tipo_projeto?: string | null
          titulo?: string
          total_ambientes?: number | null
          total_area_paredes?: number | null
          total_area_piso?: number | null
          total_perimetro?: number | null
          total_servicos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      analises_projeto_acabamentos: {
        Row: {
          ambiente_id: string | null
          analise_id: string | null
          area_m2: number | null
          criado_em: string | null
          descricao: string | null
          especificacoes: Json | null
          id: string
          material: string | null
          metragem_linear: number | null
          ordem: number | null
          origem: string | null
          quantidade: number | null
          tipo: string
          unidade: string | null
        }
        Insert: {
          ambiente_id?: string | null
          analise_id?: string | null
          area_m2?: number | null
          criado_em?: string | null
          descricao?: string | null
          especificacoes?: Json | null
          id?: string
          material?: string | null
          metragem_linear?: number | null
          ordem?: number | null
          origem?: string | null
          quantidade?: number | null
          tipo: string
          unidade?: string | null
        }
        Update: {
          ambiente_id?: string | null
          analise_id?: string | null
          area_m2?: number | null
          criado_em?: string | null
          descricao?: string | null
          especificacoes?: Json | null
          id?: string
          material?: string | null
          metragem_linear?: number | null
          ordem?: number | null
          origem?: string | null
          quantidade?: number | null
          tipo?: string
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_acabamentos_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto_ambientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_acabamentos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_acabamentos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_projeto_ambientes: {
        Row: {
          alertas: Json | null
          analise_id: string | null
          area_paredes_bruta: number | null
          area_paredes_liquida: number | null
          area_piso: number | null
          area_teto: number | null
          area_vaos_total: number | null
          atualizado_em: string | null
          circuitos: Json | null
          codigo: string | null
          comprimento: number | null
          criado_em: string | null
          editado_manualmente: boolean | null
          id: string
          interruptores_intermediario: number | null
          interruptores_paralelo: number | null
          interruptores_simples: number | null
          janelas: Json | null
          largura: number | null
          nome: string
          observacoes: string | null
          ordem: number | null
          origem: string | null
          parede_area: number | null
          parede_tipo: string | null
          pe_direito: number | null
          perimetro: number | null
          piso_area: number | null
          piso_tipo: string | null
          pontos_agua_fria: number | null
          pontos_agua_quente: number | null
          pontos_esgoto: number | null
          pontos_gas: number | null
          pontos_iluminacao: number | null
          portas: Json | null
          rodape_ml: number | null
          rodape_tipo: string | null
          teto_area: number | null
          teto_tipo: string | null
          tipo: string | null
          tomadas_110v: number | null
          tomadas_220v: number | null
          tomadas_especiais: Json | null
          tubulacao_seca: Json | null
        }
        Insert: {
          alertas?: Json | null
          analise_id?: string | null
          area_paredes_bruta?: number | null
          area_paredes_liquida?: number | null
          area_piso?: number | null
          area_teto?: number | null
          area_vaos_total?: number | null
          atualizado_em?: string | null
          circuitos?: Json | null
          codigo?: string | null
          comprimento?: number | null
          criado_em?: string | null
          editado_manualmente?: boolean | null
          id?: string
          interruptores_intermediario?: number | null
          interruptores_paralelo?: number | null
          interruptores_simples?: number | null
          janelas?: Json | null
          largura?: number | null
          nome: string
          observacoes?: string | null
          ordem?: number | null
          origem?: string | null
          parede_area?: number | null
          parede_tipo?: string | null
          pe_direito?: number | null
          perimetro?: number | null
          piso_area?: number | null
          piso_tipo?: string | null
          pontos_agua_fria?: number | null
          pontos_agua_quente?: number | null
          pontos_esgoto?: number | null
          pontos_gas?: number | null
          pontos_iluminacao?: number | null
          portas?: Json | null
          rodape_ml?: number | null
          rodape_tipo?: string | null
          teto_area?: number | null
          teto_tipo?: string | null
          tipo?: string | null
          tomadas_110v?: number | null
          tomadas_220v?: number | null
          tomadas_especiais?: Json | null
          tubulacao_seca?: Json | null
        }
        Update: {
          alertas?: Json | null
          analise_id?: string | null
          area_paredes_bruta?: number | null
          area_paredes_liquida?: number | null
          area_piso?: number | null
          area_teto?: number | null
          area_vaos_total?: number | null
          atualizado_em?: string | null
          circuitos?: Json | null
          codigo?: string | null
          comprimento?: number | null
          criado_em?: string | null
          editado_manualmente?: boolean | null
          id?: string
          interruptores_intermediario?: number | null
          interruptores_paralelo?: number | null
          interruptores_simples?: number | null
          janelas?: Json | null
          largura?: number | null
          nome?: string
          observacoes?: string | null
          ordem?: number | null
          origem?: string | null
          parede_area?: number | null
          parede_tipo?: string | null
          pe_direito?: number | null
          perimetro?: number | null
          piso_area?: number | null
          piso_tipo?: string | null
          pontos_agua_fria?: number | null
          pontos_agua_quente?: number | null
          pontos_esgoto?: number | null
          pontos_gas?: number | null
          pontos_iluminacao?: number | null
          portas?: Json | null
          rodape_ml?: number | null
          rodape_tipo?: string | null
          teto_area?: number | null
          teto_tipo?: string | null
          tipo?: string | null
          tomadas_110v?: number | null
          tomadas_220v?: number | null
          tomadas_especiais?: Json | null
          tubulacao_seca?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_ambientes_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_ambientes_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_projeto_arquivos: {
        Row: {
          analisado: boolean | null
          analise_id: string | null
          analise_resultado: Json | null
          criado_em: string | null
          id: string
          mime_type: string | null
          nome: string
          ordem: number | null
          tamanho_bytes: number | null
          tipo: string | null
          url: string
        }
        Insert: {
          analisado?: boolean | null
          analise_id?: string | null
          analise_resultado?: Json | null
          criado_em?: string | null
          id?: string
          mime_type?: string | null
          nome: string
          ordem?: number | null
          tamanho_bytes?: number | null
          tipo?: string | null
          url: string
        }
        Update: {
          analisado?: boolean | null
          analise_id?: string | null
          analise_resultado?: Json | null
          criado_em?: string | null
          id?: string
          mime_type?: string | null
          nome?: string
          ordem?: number | null
          tamanho_bytes?: number | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_arquivos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_arquivos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_projeto_elementos: {
        Row: {
          altura: number | null
          ambiente_id: string | null
          analise_id: string | null
          area: number | null
          criado_em: string | null
          descricao: string | null
          especificacoes: Json | null
          id: string
          largura: number | null
          ordem: number | null
          origem: string | null
          profundidade: number | null
          quantidade: number | null
          subtipo: string | null
          tipo: string
        }
        Insert: {
          altura?: number | null
          ambiente_id?: string | null
          analise_id?: string | null
          area?: number | null
          criado_em?: string | null
          descricao?: string | null
          especificacoes?: Json | null
          id?: string
          largura?: number | null
          ordem?: number | null
          origem?: string | null
          profundidade?: number | null
          quantidade?: number | null
          subtipo?: string | null
          tipo: string
        }
        Update: {
          altura?: number | null
          ambiente_id?: string | null
          analise_id?: string | null
          area?: number | null
          criado_em?: string | null
          descricao?: string | null
          especificacoes?: Json | null
          id?: string
          largura?: number | null
          ordem?: number | null
          origem?: string | null
          profundidade?: number | null
          quantidade?: number | null
          subtipo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_elementos_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto_ambientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_elementos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_elementos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_projeto_servicos: {
        Row: {
          ambiente_id: string | null
          ambiente_nome: string | null
          ambientes_nomes: string[] | null
          analise_id: string | null
          area: number | null
          atualizado_em: string | null
          categoria: string
          categoria_sugerida: string | null
          criado_em: string | null
          descricao: string
          especificacoes: Json | null
          id: string
          importado_para_proposta: boolean | null
          metragem_linear: number | null
          ordem: number | null
          origem: string | null
          palavras_chave: string[] | null
          pricelist_item_id: string | null
          pricelist_match_score: number | null
          quantidade: number | null
          selecionado: boolean | null
          termo_busca: string | null
          tipo: string | null
          unidade: string | null
        }
        Insert: {
          ambiente_id?: string | null
          ambiente_nome?: string | null
          ambientes_nomes?: string[] | null
          analise_id?: string | null
          area?: number | null
          atualizado_em?: string | null
          categoria: string
          categoria_sugerida?: string | null
          criado_em?: string | null
          descricao: string
          especificacoes?: Json | null
          id?: string
          importado_para_proposta?: boolean | null
          metragem_linear?: number | null
          ordem?: number | null
          origem?: string | null
          palavras_chave?: string[] | null
          pricelist_item_id?: string | null
          pricelist_match_score?: number | null
          quantidade?: number | null
          selecionado?: boolean | null
          termo_busca?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Update: {
          ambiente_id?: string | null
          ambiente_nome?: string | null
          ambientes_nomes?: string[] | null
          analise_id?: string | null
          area?: number | null
          atualizado_em?: string | null
          categoria?: string
          categoria_sugerida?: string | null
          criado_em?: string | null
          descricao?: string
          especificacoes?: Json | null
          id?: string
          importado_para_proposta?: boolean | null
          metragem_linear?: number | null
          ordem?: number | null
          origem?: string | null
          palavras_chave?: string[] | null
          pricelist_item_id?: string | null
          pricelist_match_score?: number | null
          quantidade?: number | null
          selecionado?: boolean | null
          termo_busca?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_servicos_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto_ambientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_servicos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_servicos_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      arquivos_metadata: {
        Row: {
          altura: number | null
          atualizado_em: string | null
          bucket: string
          criado_em: string | null
          entidade_id: string | null
          entidade_tipo: string | null
          id: string
          largura: number | null
          nome_original: string
          path: string
          tamanho_bytes: number | null
          temporario: boolean | null
          tipo_mime: string | null
          upload_por: string | null
          urls: Json | null
        }
        Insert: {
          altura?: number | null
          atualizado_em?: string | null
          bucket: string
          criado_em?: string | null
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          largura?: number | null
          nome_original: string
          path: string
          tamanho_bytes?: number | null
          temporario?: boolean | null
          tipo_mime?: string | null
          upload_por?: string | null
          urls?: Json | null
        }
        Update: {
          altura?: number | null
          atualizado_em?: string | null
          bucket?: string
          criado_em?: string | null
          entidade_id?: string | null
          entidade_tipo?: string | null
          id?: string
          largura?: number | null
          nome_original?: string
          path?: string
          tamanho_bytes?: number | null
          temporario?: boolean | null
          tipo_mime?: string | null
          upload_por?: string | null
          urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_metadata_upload_por_fkey"
            columns: ["upload_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_metadata_upload_por_fkey"
            columns: ["upload_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          assinatura: string | null
          criado_em: string | null
          email: string | null
          id: string
          ip: string | null
          obra_id: string | null
          user_id: string | null
        }
        Insert: {
          assinatura?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          ip?: string | null
          obra_id?: string | null
          user_id?: string | null
        }
        Update: {
          assinatura?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          ip?: string | null
          obra_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      assistencia_ordens: {
        Row: {
          cliente_id: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          criado_em: string | null
          data_abertura: string | null
          data_conclusao: string | null
          data_previsao: string | null
          data_previsao_conclusao: string | null
          descricao: string | null
          diagnostico: string | null
          endereco_atendimento: string | null
          equipamento: string | null
          id: string
          modelo: string | null
          numero: string | null
          numero_serie: string | null
          observacoes: string | null
          prioridade: string | null
          problema_relatado: string | null
          solucao: string | null
          status: string | null
          tecnico_responsavel_id: string | null
          tipo_atendimento: string
          titulo: string | null
          updated_at: string | null
          updated_by: string | null
          valor_mao_obra: number | null
          valor_pecas: number | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criado_em?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_previsao?: string | null
          data_previsao_conclusao?: string | null
          descricao?: string | null
          diagnostico?: string | null
          endereco_atendimento?: string | null
          equipamento?: string | null
          id?: string
          modelo?: string | null
          numero?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          prioridade?: string | null
          problema_relatado?: string | null
          solucao?: string | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          tipo_atendimento?: string
          titulo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criado_em?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_previsao?: string | null
          data_previsao_conclusao?: string | null
          descricao?: string | null
          diagnostico?: string | null
          endereco_atendimento?: string | null
          equipamento?: string | null
          id?: string
          modelo?: string | null
          numero?: string | null
          numero_serie?: string | null
          observacoes?: string | null
          prioridade?: string | null
          problema_relatado?: string | null
          solucao?: string | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          tipo_atendimento?: string
          titulo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_mao_obra?: number | null
          valor_pecas?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "fk_assistencia_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      assistencia_tecnica: {
        Row: {
          categoria: string
          cliente_id: string
          created_at: string | null
          data_resolucao: string | null
          descricao: string | null
          id: string
          observacoes: string | null
          prioridade: string | null
          responsavel_id: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria: string
          cliente_id: string
          created_at?: string | null
          data_resolucao?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          cliente_id?: string
          created_at?: string | null
          data_resolucao?: string | null
          descricao?: string | null
          id?: string
          observacoes?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistencia_tecnica_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_trail: {
        Row: {
          campos_alterados: string[] | null
          criado_em: string | null
          dados_antes: Json | null
          dados_depois: Json | null
          id: string
          ip_address: string | null
          operacao: string
          registro_id: string | null
          sessao_id: string | null
          tabela: string
          user_agent: string | null
          usuario_email: string | null
          usuario_id: string | null
        }
        Insert: {
          campos_alterados?: string[] | null
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          ip_address?: string | null
          operacao: string
          registro_id?: string | null
          sessao_id?: string | null
          tabela: string
          user_agent?: string | null
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Update: {
          campos_alterados?: string[] | null
          criado_em?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          ip_address?: string | null
          operacao?: string
          registro_id?: string | null
          sessao_id?: string | null
          tabela?: string
          user_agent?: string | null
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      auditoria_logs: {
        Row: {
          acao: Database["public"]["Enums"]["tipo_acao_auditoria"]
          criado_em: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown
          pessoa_id: string | null
          registro_id: string | null
          tabela: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: Database["public"]["Enums"]["tipo_acao_auditoria"]
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          pessoa_id?: string | null
          registro_id?: string | null
          tabela: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: Database["public"]["Enums"]["tipo_acao_auditoria"]
          criado_em?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          pessoa_id?: string | null
          registro_id?: string | null
          tabela?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditoria_logs_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      cadastros_pendentes: {
        Row: {
          agencia: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string | null
          banco: string | null
          cargo: string | null
          categoria_comissao_id: string | null
          cep: string | null
          cidade: string | null
          conta: string | null
          cpf_cnpj: string | null
          criado_em: string | null
          email: string | null
          empresa: string | null
          endereco: string | null
          enviado_por: string | null
          enviado_via: string | null
          estado: string | null
          expira_em: string | null
          id: string
          indicado_por_id: string | null
          link_pai_id: string | null
          motivo_rejeicao: string | null
          nome: string | null
          nucleo_id: string | null
          observacoes: string | null
          pessoa_id: string | null
          pix: string | null
          preenchido_em: string | null
          reutilizavel: boolean | null
          status: string
          telefone: string | null
          tipo_conta: string | null
          tipo_solicitado: string
          tipo_usuario_aprovado: string | null
          titulo_pagina: string | null
          token: string
          total_usos: number | null
          uso_maximo: number | null
          usuario_id: string | null
        }
        Insert: {
          agencia?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          banco?: string | null
          cargo?: string | null
          categoria_comissao_id?: string | null
          cep?: string | null
          cidade?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          enviado_por?: string | null
          enviado_via?: string | null
          estado?: string | null
          expira_em?: string | null
          id?: string
          indicado_por_id?: string | null
          link_pai_id?: string | null
          motivo_rejeicao?: string | null
          nome?: string | null
          nucleo_id?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          pix?: string | null
          preenchido_em?: string | null
          reutilizavel?: boolean | null
          status?: string
          telefone?: string | null
          tipo_conta?: string | null
          tipo_solicitado: string
          tipo_usuario_aprovado?: string | null
          titulo_pagina?: string | null
          token: string
          total_usos?: number | null
          uso_maximo?: number | null
          usuario_id?: string | null
        }
        Update: {
          agencia?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          banco?: string | null
          cargo?: string | null
          categoria_comissao_id?: string | null
          cep?: string | null
          cidade?: string | null
          conta?: string | null
          cpf_cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          enviado_por?: string | null
          enviado_via?: string | null
          estado?: string | null
          expira_em?: string | null
          id?: string
          indicado_por_id?: string | null
          link_pai_id?: string | null
          motivo_rejeicao?: string | null
          nome?: string | null
          nucleo_id?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          pix?: string | null
          preenchido_em?: string | null
          reutilizavel?: boolean | null
          status?: string
          telefone?: string | null
          tipo_conta?: string | null
          tipo_solicitado?: string
          tipo_usuario_aprovado?: string | null
          titulo_pagina?: string | null
          token?: string
          total_usos?: number | null
          uso_maximo?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastros_pendentes_categoria_comissao_id_fkey"
            columns: ["categoria_comissao_id"]
            isOneToOne: false
            referencedRelation: "categorias_comissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_link_pai_id_fkey"
            columns: ["link_pai_id"]
            isOneToOne: false
            referencedRelation: "cadastros_pendentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_link_pai_id_fkey"
            columns: ["link_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_cadastros_pendentes"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_comissao: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          id: string
          is_indicacao: boolean | null
          is_master: boolean | null
          nome: string
          ordem: number | null
          tipo_pessoa: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          is_indicacao?: boolean | null
          is_master?: boolean | null
          nome: string
          ordem?: number | null
          tipo_pessoa: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          is_indicacao?: boolean | null
          is_master?: boolean | null
          nome?: string
          ordem?: number | null
          tipo_pessoa?: string
        }
        Relationships: []
      }
      categorias_compras: {
        Row: {
          ativo: boolean | null
          categoria_pai_id: string | null
          codigo: string
          created_at: string | null
          etapa_obra: string | null
          id: string
          nome: string
          ordem_execucao: number | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_pai_id?: string | null
          codigo: string
          created_at?: string | null
          etapa_obra?: string | null
          id?: string
          nome: string
          ordem_execucao?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_pai_id?: string | null
          codigo?: string
          created_at?: string | null
          etapa_obra?: string | null
          id?: string
          nome?: string
          ordem_execucao?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_compras_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias_compras"
            referencedColumns: ["id"]
          },
        ]
      }
      category_sequences: {
        Row: {
          categoria_id: string | null
          category: string | null
          created_at: string | null
          current_value: number
          id: string
          last_seq: number | null
          updated_at: string | null
        }
        Insert: {
          categoria_id?: string | null
          category?: string | null
          created_at?: string | null
          current_value?: number
          id?: string
          last_seq?: number | null
          updated_at?: string | null
        }
        Update: {
          categoria_id?: string | null
          category?: string | null
          created_at?: string | null
          current_value?: number
          id?: string
          last_seq?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      centro_custo: {
        Row: {
          ativo: boolean | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      ceo_checklist_diario: {
        Row: {
          created_at: string | null
          data: string
          id: string
          observacoes: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          observacoes?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceo_checklist_diario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceo_checklist_diario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      ceo_checklist_itens: {
        Row: {
          checklist_id: string
          concluido: boolean | null
          concluido_em: string | null
          created_at: string | null
          fonte: string | null
          id: string
          ordem: number | null
          prioridade: string | null
          referencia_id: string | null
          texto: string
        }
        Insert: {
          checklist_id: string
          concluido?: boolean | null
          concluido_em?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          ordem?: number | null
          prioridade?: string | null
          referencia_id?: string | null
          texto: string
        }
        Update: {
          checklist_id?: string
          concluido?: boolean | null
          concluido_em?: string | null
          created_at?: string | null
          fonte?: string | null
          id?: string
          ordem?: number | null
          prioridade?: string | null
          referencia_id?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceo_checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "ceo_checklist_diario"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_itens: {
        Row: {
          checklist_id: string
          concluido: boolean | null
          concluido_em: string | null
          concluido_por: string | null
          created_at: string | null
          data_limite: string | null
          id: string
          ordem: number | null
          secao: string | null
          texto: string
          updated_at: string | null
        }
        Insert: {
          checklist_id: string
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string | null
          data_limite?: string | null
          id?: string
          ordem?: number | null
          secao?: string | null
          texto: string
          updated_at?: string | null
        }
        Update: {
          checklist_id?: string
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string | null
          data_limite?: string | null
          id?: string
          ordem?: number | null
          secao?: string | null
          texto?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_itens_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_itens_concluido_por_fkey"
            columns: ["concluido_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          criado_em: string | null
          grupo: string | null
          id: string
          ordem: number | null
          template_id: string
          texto: string
        }
        Insert: {
          criado_em?: string | null
          grupo?: string | null
          id?: string
          ordem?: number | null
          template_id: string
          texto: string
        }
        Update: {
          criado_em?: string | null
          grupo?: string | null
          id?: string
          ordem?: number | null
          template_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_itens: {
        Row: {
          created_at: string | null
          id: string
          ordem: number | null
          secao: string | null
          template_id: string
          texto: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          secao?: string | null
          template_id: string
          texto: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          secao?: string | null
          template_id?: string
          texto?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          nucleo: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          nucleo: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          nucleo?: string
          ordem?: number | null
        }
        Relationships: []
      }
      checklists: {
        Row: {
          created_at: string | null
          data_conclusao: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nucleo_id: string | null
          ordem: number | null
          progresso: number | null
          status: string | null
          template_id: string | null
          titulo: string
          updated_at: string | null
          vinculo_id: string
          vinculo_tipo: string
        }
        Insert: {
          created_at?: string | null
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nucleo_id?: string | null
          ordem?: number | null
          progresso?: number | null
          status?: string | null
          template_id?: string | null
          titulo: string
          updated_at?: string | null
          vinculo_id: string
          vinculo_tipo: string
        }
        Update: {
          created_at?: string | null
          data_conclusao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nucleo_id?: string | null
          ordem?: number | null
          progresso?: number | null
          status?: string | null
          template_id?: string | null
          titulo?: string
          updated_at?: string | null
          vinculo_id?: string
          vinculo_tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "checklists_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      cliente_checklist_items: {
        Row: {
          checklist_id: string
          concluido: boolean | null
          concluido_em: string | null
          concluido_por: string | null
          criado_em: string | null
          id: string
          ordem: number | null
          texto: string
        }
        Insert: {
          checklist_id: string
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string | null
          id?: string
          ordem?: number | null
          texto: string
        }
        Update: {
          checklist_id?: string
          concluido?: boolean | null
          concluido_em?: string | null
          concluido_por?: string | null
          criado_em?: string | null
          id?: string
          ordem?: number | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "cliente_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_checklists: {
        Row: {
          atualizado_em: string | null
          concluido: boolean | null
          criado_em: string | null
          id: string
          nome: string
          oportunidade_id: string | null
          progresso: number | null
          template_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          concluido?: boolean | null
          criado_em?: string | null
          id?: string
          nome: string
          oportunidade_id?: string | null
          progresso?: number | null
          template_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          concluido?: boolean | null
          criado_em?: string | null
          id?: string
          nome?: string
          oportunidade_id?: string | null
          progresso?: number | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_checklists_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_checklists_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "cliente_checklists_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas: {
        Row: {
          cliente: string
          conta_bancaria_id: string | null
          contrato_id: string | null
          created_at: string | null
          id: string
          integracao_tipo: string | null
          lancamento_id: string | null
          link_pagamento: string | null
          nucleo: string | null
          obra_id: string | null
          observacoes: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          cliente: string
          conta_bancaria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          integracao_tipo?: string | null
          lancamento_id?: string | null
          link_pagamento?: string | null
          nucleo?: string | null
          obra_id?: string | null
          observacoes?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          cliente?: string
          conta_bancaria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          integracao_tipo?: string | null
          lancamento_id?: string | null
          link_pagamento?: string | null
          nucleo?: string | null
          obra_id?: string | null
          observacoes?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_conta_bancaria_id_fkey"
            columns: ["conta_bancaria_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "cobrancas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "cobrancas_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      colaborador_perfis: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          id: string
          nivel_hierarquico: number | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nivel_hierarquico?: number | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nivel_hierarquico?: number | null
          nome?: string
        }
        Relationships: []
      }
      colaborador_projetos: {
        Row: {
          ativo: boolean | null
          colaborador_id: string
          criado_em: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          funcao: string | null
          id: string
          projeto_id: string
        }
        Insert: {
          ativo?: boolean | null
          colaborador_id: string
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          funcao?: string | null
          id?: string
          projeto_id: string
        }
        Update: {
          ativo?: boolean | null
          colaborador_id?: string
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          funcao?: string | null
          id?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "colaborador_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "colaborador_projetos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      colaborador_valores_receber: {
        Row: {
          atualizado_em: string | null
          colaborador_id: string
          condicao_liberacao: string | null
          criado_em: string | null
          criado_por: string | null
          data_liberacao: string | null
          data_pagamento: string | null
          data_prevista: string | null
          descricao: string | null
          id: string
          parcela_id: string | null
          percentual: number | null
          projeto_id: string | null
          solicitacao_pagamento_id: string | null
          status: Database["public"]["Enums"]["status_valor_receber"] | null
          tipo: Database["public"]["Enums"]["tipo_valor_receber"]
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          colaborador_id: string
          condicao_liberacao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_liberacao?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          descricao?: string | null
          id?: string
          parcela_id?: string | null
          percentual?: number | null
          projeto_id?: string | null
          solicitacao_pagamento_id?: string | null
          status?: Database["public"]["Enums"]["status_valor_receber"] | null
          tipo: Database["public"]["Enums"]["tipo_valor_receber"]
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          colaborador_id?: string
          condicao_liberacao?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_liberacao?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          descricao?: string | null
          id?: string
          parcela_id?: string | null
          percentual?: number | null
          projeto_id?: string | null
          solicitacao_pagamento_id?: string | null
          status?: Database["public"]["Enums"]["status_valor_receber"] | null
          tipo?: Database["public"]["Enums"]["tipo_valor_receber"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "colaborador_valores_receber_solicitacao_pagamento_id_fkey"
            columns: ["solicitacao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_notificacoes: {
        Row: {
          comentario_id: string
          created_at: string | null
          id: string
          lida: boolean | null
          usuario_id: string
        }
        Insert: {
          comentario_id: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          usuario_id: string
        }
        Update: {
          comentario_id?: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_notificacoes_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "project_tasks_comentarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes: {
        Row: {
          created_at: string | null
          id: string
          mes_referencia: string
          observacoes: string | null
          percentual: number
          status: string
          updated_at: string | null
          valor: number
          vgv: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          percentual: number
          status?: string
          updated_at?: string | null
          valor: number
          vgv: number
        }
        Update: {
          created_at?: string | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          percentual?: number
          status?: string
          updated_at?: string | null
          valor?: number
          vgv?: number
        }
        Relationships: []
      }
      compras_itens: {
        Row: {
          categoria: string | null
          criado_em: string | null
          fornecedor_id: string | null
          id: string
          imagem_url: string | null
          link_origem: string | null
          preco: number | null
          sku: string | null
          titulo: string
        }
        Insert: {
          categoria?: string | null
          criado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          link_origem?: string | null
          preco?: number | null
          sku?: string | null
          titulo: string
        }
        Update: {
          categoria?: string | null
          criado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          link_origem?: string | null
          preco?: number | null
          sku?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      config_kanban_status: {
        Row: {
          ativo: boolean | null
          codigo: string
          cor: string | null
          id: string
          nucleo: string
          ordem: number | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          cor?: string | null
          id?: string
          nucleo: string
          ordem?: number | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          cor?: string | null
          id?: string
          nucleo?: string
          ordem?: number | null
          titulo?: string
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          banco: string
          btg_api_key: string | null
          conta: string | null
          conta_real: boolean | null
          created_at: string | null
          id: string
          integracao_tipo: string | null
          nome: string
          nucleo: string
          pix_chave: string | null
          pix_tipo: string | null
          santander_api_key: string | null
          stripe_account_id: string | null
          tipo_conta: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          banco: string
          btg_api_key?: string | null
          conta?: string | null
          conta_real?: boolean | null
          created_at?: string | null
          id?: string
          integracao_tipo?: string | null
          nome: string
          nucleo: string
          pix_chave?: string | null
          pix_tipo?: string | null
          santander_api_key?: string | null
          stripe_account_id?: string | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          banco?: string
          btg_api_key?: string | null
          conta?: string | null
          conta_real?: boolean | null
          created_at?: string | null
          id?: string
          integracao_tipo?: string | null
          nome?: string
          nucleo?: string
          pix_chave?: string | null
          pix_tipo?: string | null
          santander_api_key?: string | null
          stripe_account_id?: string | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_number_seq: {
        Row: {
          dt: string
          id: string
          nucleo: string
          seq: number
        }
        Insert: {
          dt: string
          id?: string
          nucleo: string
          seq?: number
        }
        Update: {
          dt?: string
          id?: string
          nucleo?: string
          seq?: number
        }
        Relationships: []
      }
      contratos: {
        Row: {
          antecipar_recebimento: boolean | null
          assinatura_cliente_base64: string | null
          assinatura_responsavel_base64: string | null
          cliente_id: string | null
          codigo: string | null
          condicoes_contratuais: string | null
          conteudo_gerado: string | null
          contrato_grupo_id: string | null
          created_at: string | null
          created_by: string | null
          criado_em: string | null
          cronograma_id: string | null
          dados_cliente_json: Json | null
          dados_imovel_json: Json | null
          data_assinatura: string | null
          data_criacao: string | null
          data_fim: string | null
          data_inicio: string | null
          data_previsao_termino: string | null
          data_termino_real: string | null
          descricao: string | null
          documento_url: string | null
          duracao_dias_uteis: number | null
          empresa_id: string | null
          financeiro_modo: string | null
          financeiro_observacoes: string | null
          forma_pagamento: string | null
          id: string
          memorial_executivo_id: string | null
          modelo_juridico_id: string | null
          nucleo: string | null
          nucleo_id: string | null
          nucleos_selecionados: string[] | null
          numero: string | null
          numero_parcelas: number | null
          obra_id: string | null
          observacoes: string | null
          oportunidade_id: string | null
          percentual_entrada: number | null
          proposta_id: string | null
          snapshot_modelo: Json | null
          status: string | null
          taxa_antecipacao: number | null
          tipo_financeiro: string | null
          titulo: string | null
          unidade_negocio: string | null
          updated_at: string | null
          updated_by: string | null
          valor_entrada: number | null
          valor_mao_obra: number | null
          valor_materiais: number | null
          valor_parcela: number | null
          valor_total: number | null
          versao_modelo: number | null
        }
        Insert: {
          antecipar_recebimento?: boolean | null
          assinatura_cliente_base64?: string | null
          assinatura_responsavel_base64?: string | null
          cliente_id?: string | null
          codigo?: string | null
          condicoes_contratuais?: string | null
          conteudo_gerado?: string | null
          contrato_grupo_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criado_em?: string | null
          cronograma_id?: string | null
          dados_cliente_json?: Json | null
          dados_imovel_json?: Json | null
          data_assinatura?: string | null
          data_criacao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_previsao_termino?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          documento_url?: string | null
          duracao_dias_uteis?: number | null
          empresa_id?: string | null
          financeiro_modo?: string | null
          financeiro_observacoes?: string | null
          forma_pagamento?: string | null
          id?: string
          memorial_executivo_id?: string | null
          modelo_juridico_id?: string | null
          nucleo?: string | null
          nucleo_id?: string | null
          nucleos_selecionados?: string[] | null
          numero?: string | null
          numero_parcelas?: number | null
          obra_id?: string | null
          observacoes?: string | null
          oportunidade_id?: string | null
          percentual_entrada?: number | null
          proposta_id?: string | null
          snapshot_modelo?: Json | null
          status?: string | null
          taxa_antecipacao?: number | null
          tipo_financeiro?: string | null
          titulo?: string | null
          unidade_negocio?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_entrada?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_parcela?: number | null
          valor_total?: number | null
          versao_modelo?: number | null
        }
        Update: {
          antecipar_recebimento?: boolean | null
          assinatura_cliente_base64?: string | null
          assinatura_responsavel_base64?: string | null
          cliente_id?: string | null
          codigo?: string | null
          condicoes_contratuais?: string | null
          conteudo_gerado?: string | null
          contrato_grupo_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criado_em?: string | null
          cronograma_id?: string | null
          dados_cliente_json?: Json | null
          dados_imovel_json?: Json | null
          data_assinatura?: string | null
          data_criacao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_previsao_termino?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          documento_url?: string | null
          duracao_dias_uteis?: number | null
          empresa_id?: string | null
          financeiro_modo?: string | null
          financeiro_observacoes?: string | null
          forma_pagamento?: string | null
          id?: string
          memorial_executivo_id?: string | null
          modelo_juridico_id?: string | null
          nucleo?: string | null
          nucleo_id?: string | null
          nucleos_selecionados?: string[] | null
          numero?: string | null
          numero_parcelas?: number | null
          obra_id?: string | null
          observacoes?: string | null
          oportunidade_id?: string | null
          percentual_entrada?: number | null
          proposta_id?: string | null
          snapshot_modelo?: Json | null
          status?: string | null
          taxa_antecipacao?: number | null
          tipo_financeiro?: string | null
          titulo?: string | null
          unidade_negocio?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_entrada?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_parcela?: number | null
          valor_total?: number | null
          versao_modelo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_memorial_executivo_id_fkey"
            columns: ["memorial_executivo_id"]
            isOneToOne: false
            referencedRelation: "juridico_memorial_executivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_modelo_juridico_id_fkey"
            columns: ["modelo_juridico_id"]
            isOneToOne: false
            referencedRelation: "juridico_modelos_contrato"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "contratos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "contratos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_contratos_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_compras_gerenciadas: {
        Row: {
          comprovante_url: string | null
          contrato_id: string
          created_at: string | null
          data_compra: string | null
          descricao: string
          fee_percentual: number | null
          fee_valor: number | null
          fornecedor: string | null
          id: string
          nota_fiscal: string | null
          nucleo: string
          status: string | null
          updated_at: string | null
          valor_compra: number
        }
        Insert: {
          comprovante_url?: string | null
          contrato_id: string
          created_at?: string | null
          data_compra?: string | null
          descricao: string
          fee_percentual?: number | null
          fee_valor?: number | null
          fornecedor?: string | null
          id?: string
          nota_fiscal?: string | null
          nucleo?: string
          status?: string | null
          updated_at?: string | null
          valor_compra?: number
        }
        Update: {
          comprovante_url?: string | null
          contrato_id?: string
          created_at?: string | null
          data_compra?: string | null
          descricao?: string
          fee_percentual?: number | null
          fee_valor?: number | null
          fornecedor?: string | null
          id?: string
          nota_fiscal?: string | null
          nucleo?: string
          status?: string | null
          updated_at?: string | null
          valor_compra?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_documentos: {
        Row: {
          assinado: boolean | null
          assinante_nome: string | null
          contrato_id: string
          created_at: string | null
          data_assinatura: string | null
          descricao: string | null
          id: string
          mime_type: string | null
          nome: string
          tamanho_bytes: number | null
          tipo: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          assinado?: boolean | null
          assinante_nome?: string | null
          contrato_id: string
          created_at?: string | null
          data_assinatura?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          nome: string
          tamanho_bytes?: number | null
          tipo: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          assinado?: boolean | null
          assinante_nome?: string | null
          contrato_id?: string
          created_at?: string | null
          data_assinatura?: string | null
          descricao?: string | null
          id?: string
          mime_type?: string | null
          nome?: string
          tamanho_bytes?: number | null
          tipo?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_documentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_documentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_documentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_etapas: {
        Row: {
          contrato_id: string
          created_at: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          data_pagamento: string | null
          data_termino_prevista: string | null
          data_termino_real: string | null
          descricao: string | null
          id: string
          nome: string
          observacoes: string | null
          ordem: number
          pago: boolean | null
          percentual_pagamento: number | null
          prazo_dias_uteis: number | null
          status: string | null
          updated_at: string | null
          valor_pagamento: number | null
        }
        Insert: {
          contrato_id: string
          created_at?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          data_pagamento?: string | null
          data_termino_prevista?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          ordem: number
          pago?: boolean | null
          percentual_pagamento?: number | null
          prazo_dias_uteis?: number | null
          status?: string | null
          updated_at?: string | null
          valor_pagamento?: number | null
        }
        Update: {
          contrato_id?: string
          created_at?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          data_pagamento?: string | null
          data_termino_prevista?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          ordem?: number
          pago?: boolean | null
          percentual_pagamento?: number | null
          prazo_dias_uteis?: number | null
          status?: string | null
          updated_at?: string | null
          valor_pagamento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_etapas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_etapas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_etapas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_etapas_padrao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
          percentual_pagamento: number | null
          prazo_dias_uteis: number | null
          unidade_negocio: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem: number
          percentual_pagamento?: number | null
          prazo_dias_uteis?: number | null
          unidade_negocio: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          percentual_pagamento?: number | null
          prazo_dias_uteis?: number | null
          unidade_negocio?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contratos_fees: {
        Row: {
          contrato_id: string | null
          criado_em: string | null
          id: string
          percentual: number | null
          tipo: string | null
          valor: number | null
        }
        Insert: {
          contrato_id?: string | null
          criado_em?: string | null
          id?: string
          percentual?: number | null
          tipo?: string | null
          valor?: number | null
        }
        Update: {
          contrato_id?: string | null
          criado_em?: string | null
          id?: string
          percentual?: number | null
          tipo?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_fees_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fees_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_fees_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_itens: {
        Row: {
          categoria: string | null
          categoria_id: string | null
          contrato_id: string
          created_at: string | null
          descricao: string | null
          dias_estimados: number | null
          id: string
          nucleo: string | null
          nucleo_id: string | null
          ordem: number | null
          producao_diaria: number | null
          proposta_item_id: string | null
          quantidade: number | null
          tipo: string | null
          tipo_financeiro: string | null
          unidade: string | null
          updated_at: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          categoria?: string | null
          categoria_id?: string | null
          contrato_id: string
          created_at?: string | null
          descricao?: string | null
          dias_estimados?: number | null
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          producao_diaria?: number | null
          proposta_item_id?: string | null
          quantidade?: number | null
          tipo?: string | null
          tipo_financeiro?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          categoria?: string | null
          categoria_id?: string | null
          contrato_id?: string
          created_at?: string | null
          descricao?: string | null
          dias_estimados?: number | null
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          producao_diaria?: number | null
          proposta_item_id?: string | null
          quantidade?: number | null
          tipo?: string | null
          tipo_financeiro?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "contratos_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "contratos_itens_proposta_item_id_fkey"
            columns: ["proposta_item_id"]
            isOneToOne: false
            referencedRelation: "propostas_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_marcenaria_ambientes: {
        Row: {
          acabamentos: Json | null
          ambiente: string
          amortecedor_corredica: string | null
          amortecedor_dobradica: string | null
          caixas: string | null
          contrato_id: string
          corredica: string | null
          created_at: string | null
          dobradica: string | null
          id: string
          lacca: string | null
          medidas_json: Json | null
          observacoes: string | null
          ordem: number | null
          portas: string | null
          puxador: string | null
          updated_at: string | null
        }
        Insert: {
          acabamentos?: Json | null
          ambiente: string
          amortecedor_corredica?: string | null
          amortecedor_dobradica?: string | null
          caixas?: string | null
          contrato_id: string
          corredica?: string | null
          created_at?: string | null
          dobradica?: string | null
          id?: string
          lacca?: string | null
          medidas_json?: Json | null
          observacoes?: string | null
          ordem?: number | null
          portas?: string | null
          puxador?: string | null
          updated_at?: string | null
        }
        Update: {
          acabamentos?: Json | null
          ambiente?: string
          amortecedor_corredica?: string | null
          amortecedor_dobradica?: string | null
          caixas?: string | null
          contrato_id?: string
          corredica?: string | null
          created_at?: string | null
          dobradica?: string | null
          id?: string
          lacca?: string | null
          medidas_json?: Json | null
          observacoes?: string | null
          ordem?: number | null
          portas?: string | null
          puxador?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_marcenaria_ambientes_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_marcenaria_ambientes_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_marcenaria_ambientes_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_nucleos: {
        Row: {
          atualizado_em: string | null
          contrato_id: string | null
          criado_em: string | null
          dados_especificos: Json | null
          data_conclusao: string | null
          data_inicio: string | null
          data_previsao: string | null
          equipe_ids: string[] | null
          id: string
          nucleo: string
          observacoes: string | null
          oportunidade_id: string | null
          progresso: number | null
          responsavel_id: string | null
          status_kanban: string | null
          valor_executado: number | null
          valor_previsto: number | null
        }
        Insert: {
          atualizado_em?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          dados_especificos?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          equipe_ids?: string[] | null
          id?: string
          nucleo: string
          observacoes?: string | null
          oportunidade_id?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          status_kanban?: string | null
          valor_executado?: number | null
          valor_previsto?: number | null
        }
        Update: {
          atualizado_em?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          dados_especificos?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          equipe_ids?: string[] | null
          id?: string
          nucleo?: string
          observacoes?: string | null
          oportunidade_id?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          status_kanban?: string | null
          valor_executado?: number | null
          valor_previsto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      contratos_pagamentos: {
        Row: {
          contrato_id: string
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          etapa_id: string | null
          forma_pagamento: string | null
          id: string
          numero_parcela: number | null
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          contrato_id: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          etapa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          numero_parcela?: number | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          contrato_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          etapa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          numero_parcela?: number | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "contratos_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_pagamentos_nucleo: {
        Row: {
          conta_bancaria_id: string | null
          conta_tipo: string | null
          contrato_id: string
          created_at: string | null
          dia_vencimento: number | null
          fee_gestao_percentual: number | null
          fee_gestao_valor: number | null
          forma_pagamento: string | null
          id: string
          modalidade_materiais: string | null
          nucleo: string
          numero_parcelas: number | null
          percentual_entrada: number | null
          status: string | null
          updated_at: string | null
          valor_entrada: number | null
          valor_mao_obra: number | null
          valor_materiais: number | null
          valor_parcela: number | null
          valor_total: number
        }
        Insert: {
          conta_bancaria_id?: string | null
          conta_tipo?: string | null
          contrato_id: string
          created_at?: string | null
          dia_vencimento?: number | null
          fee_gestao_percentual?: number | null
          fee_gestao_valor?: number | null
          forma_pagamento?: string | null
          id?: string
          modalidade_materiais?: string | null
          nucleo: string
          numero_parcelas?: number | null
          percentual_entrada?: number | null
          status?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_parcela?: number | null
          valor_total?: number
        }
        Update: {
          conta_bancaria_id?: string | null
          conta_tipo?: string | null
          contrato_id?: string
          created_at?: string | null
          dia_vencimento?: number | null
          fee_gestao_percentual?: number | null
          fee_gestao_valor?: number | null
          forma_pagamento?: string | null
          id?: string
          modalidade_materiais?: string | null
          nucleo?: string
          numero_parcelas?: number | null
          percentual_entrada?: number | null
          status?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_parcela?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_pagamentos_nucleo_conta_bancaria_id_fkey"
            columns: ["conta_bancaria_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_nucleo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_nucleo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_pagamentos_nucleo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      contratos_templates: {
        Row: {
          ativo: boolean | null
          campos_variaveis: Json | null
          conteudo_template: Json | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          unidade_negocio: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_variaveis?: Json | null
          conteudo_template?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          unidade_negocio: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_variaveis?: Json | null
          conteudo_template?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          unidade_negocio?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cotacao_fornecedores: {
        Row: {
          cotacao_id: string
          data_convite: string | null
          data_visualizacao: string | null
          fornecedor_id: string
          id: string
          motivo_declinio: string | null
          participando: boolean | null
          visualizado: boolean | null
        }
        Insert: {
          cotacao_id: string
          data_convite?: string | null
          data_visualizacao?: string | null
          fornecedor_id: string
          id?: string
          motivo_declinio?: string | null
          participando?: boolean | null
          visualizado?: boolean | null
        }
        Update: {
          cotacao_id?: string
          data_convite?: string | null
          data_visualizacao?: string | null
          fornecedor_id?: string
          id?: string
          motivo_declinio?: string | null
          participando?: boolean | null
          visualizado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_fornecedores_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      cotacao_itens: {
        Row: {
          cotacao_id: string
          criado_em: string | null
          descricao: string
          especificacao: string | null
          id: string
          ordem: number | null
          quantidade: number | null
          referencia: string | null
          unidade: string | null
        }
        Insert: {
          cotacao_id: string
          criado_em?: string | null
          descricao: string
          especificacao?: string | null
          id?: string
          ordem?: number | null
          quantidade?: number | null
          referencia?: string | null
          unidade?: string | null
        }
        Update: {
          cotacao_id?: string
          criado_em?: string | null
          descricao?: string
          especificacao?: string | null
          id?: string
          ordem?: number | null
          quantidade?: number | null
          referencia?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_itens_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_itens_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["id"]
          },
        ]
      }
      cotacao_proposta_anexos: {
        Row: {
          arquivo_url: string
          criado_em: string | null
          id: string
          nome: string
          proposta_id: string
          tamanho_bytes: number | null
          tipo: string | null
        }
        Insert: {
          arquivo_url: string
          criado_em?: string | null
          id?: string
          nome: string
          proposta_id: string
          tamanho_bytes?: number | null
          tipo?: string | null
        }
        Update: {
          arquivo_url?: string
          criado_em?: string | null
          id?: string
          nome?: string
          proposta_id?: string
          tamanho_bytes?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_proposta_anexos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "cotacao_propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_proposta_anexos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      cotacao_proposta_itens: {
        Row: {
          criado_em: string | null
          id: string
          item_id: string
          marca_modelo: string | null
          observacao: string | null
          proposta_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          criado_em?: string | null
          id?: string
          item_id: string
          marca_modelo?: string | null
          observacao?: string | null
          proposta_id: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          criado_em?: string | null
          id?: string
          item_id?: string
          marca_modelo?: string | null
          observacao?: string | null
          proposta_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_proposta_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cotacao_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "cotacao_propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      cotacao_propostas: {
        Row: {
          atualizado_em: string | null
          comentario_interno: string | null
          condicoes_pagamento: string | null
          cotacao_id: string
          criado_em: string | null
          data_envio: string | null
          descricao_garantia: string | null
          fornecedor_id: string
          garantia_meses: number | null
          id: string
          nota_interna: number | null
          observacoes: string | null
          prazo_execucao_dias: number | null
          status:
            | Database["public"]["Enums"]["status_proposta_fornecedor"]
            | null
          validade_proposta_dias: number | null
          valor_total: number
        }
        Insert: {
          atualizado_em?: string | null
          comentario_interno?: string | null
          condicoes_pagamento?: string | null
          cotacao_id: string
          criado_em?: string | null
          data_envio?: string | null
          descricao_garantia?: string | null
          fornecedor_id: string
          garantia_meses?: number | null
          id?: string
          nota_interna?: number | null
          observacoes?: string | null
          prazo_execucao_dias?: number | null
          status?:
            | Database["public"]["Enums"]["status_proposta_fornecedor"]
            | null
          validade_proposta_dias?: number | null
          valor_total: number
        }
        Update: {
          atualizado_em?: string | null
          comentario_interno?: string | null
          condicoes_pagamento?: string | null
          cotacao_id?: string
          criado_em?: string | null
          data_envio?: string | null
          descricao_garantia?: string | null
          fornecedor_id?: string
          garantia_meses?: number | null
          id?: string
          nota_interna?: number | null
          observacoes?: string | null
          prazo_execucao_dias?: number | null
          status?:
            | Database["public"]["Enums"]["status_proposta_fornecedor"]
            | null
          validade_proposta_dias?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_propostas_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_propostas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      cotacoes: {
        Row: {
          atualizado_em: string | null
          categoria_id: string
          criado_em: string | null
          criado_por: string | null
          data_abertura: string | null
          data_fechamento: string | null
          data_limite: string
          descricao: string | null
          exige_visita_tecnica: boolean | null
          fornecedor_vencedor_id: string | null
          id: string
          numero_cotacao: string | null
          observacao_fechamento: string | null
          permite_proposta_parcial: boolean | null
          prazo_execucao_dias: number | null
          projeto_id: string | null
          projeto_nome: string | null
          status: Database["public"]["Enums"]["status_cotacao"] | null
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria_id: string
          criado_em?: string | null
          criado_por?: string | null
          data_abertura?: string | null
          data_fechamento?: string | null
          data_limite: string
          descricao?: string | null
          exige_visita_tecnica?: boolean | null
          fornecedor_vencedor_id?: string | null
          id?: string
          numero_cotacao?: string | null
          observacao_fechamento?: string | null
          permite_proposta_parcial?: boolean | null
          prazo_execucao_dias?: number | null
          projeto_id?: string | null
          projeto_nome?: string | null
          status?: Database["public"]["Enums"]["status_cotacao"] | null
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          categoria_id?: string
          criado_em?: string | null
          criado_por?: string | null
          data_abertura?: string | null
          data_fechamento?: string | null
          data_limite?: string
          descricao?: string | null
          exige_visita_tecnica?: boolean | null
          fornecedor_vencedor_id?: string | null
          id?: string
          numero_cotacao?: string | null
          observacao_fechamento?: string | null
          permite_proposta_parcial?: boolean | null
          prazo_execucao_dias?: number | null
          projeto_id?: string | null
          projeto_nome?: string | null
          status?: Database["public"]["Enums"]["status_cotacao"] | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fornecedor_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_fornecedor_vencedor_id_fkey"
            columns: ["fornecedor_vencedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cotacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "cotacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      cronograma: {
        Row: {
          data_fim: string | null
          data_inicio: string | null
          etapa: string
          id: string
          id_financeiro: string | null
          id_obra: string
          nucleo: string | null
          status: string | null
          valor_executado: number | null
          valor_previsto: number | null
        }
        Insert: {
          data_fim?: string | null
          data_inicio?: string | null
          etapa: string
          id?: string
          id_financeiro?: string | null
          id_obra: string
          nucleo?: string | null
          status?: string | null
          valor_executado?: number | null
          valor_previsto?: number | null
        }
        Update: {
          data_fim?: string | null
          data_inicio?: string | null
          etapa?: string
          id?: string
          id_financeiro?: string | null
          id_obra?: string
          nucleo?: string | null
          status?: string | null
          valor_executado?: number | null
          valor_previsto?: number | null
        }
        Relationships: []
      }
      cronograma_etapas: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          descricao: string | null
          etapa_pai_id: string | null
          id: string
          nome: string
          nucleo: string | null
          observacoes: string | null
          ordem: number | null
          progresso: number | null
          projeto_id: string
          referencia_id: string | null
          referencia_tipo: string | null
          responsavel_id: string | null
          status: string | null
          tipo: string | null
          unidade: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          etapa_pai_id?: string | null
          id?: string
          nome: string
          nucleo?: string | null
          observacoes?: string | null
          ordem?: number | null
          progresso?: number | null
          projeto_id: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          etapa_pai_id?: string | null
          id?: string
          nome?: string
          nucleo?: string | null
          observacoes?: string | null
          ordem?: number | null
          progresso?: number | null
          projeto_id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_etapas_etapa_pai_id_fkey"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "cronograma_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "cronograma_etapas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      cronograma_financeiro: {
        Row: {
          criado_em: string | null
          cronograma_id: string
          financeiro_id: string
          id: string
          nucleo: string | null
          relacao: string | null
        }
        Insert: {
          criado_em?: string | null
          cronograma_id: string
          financeiro_id: string
          id?: string
          nucleo?: string | null
          relacao?: string | null
        }
        Update: {
          criado_em?: string | null
          cronograma_id?: string
          financeiro_id?: string
          id?: string
          nucleo?: string | null
          relacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cf_cronograma"
            columns: ["cronograma_id"]
            isOneToOne: false
            referencedRelation: "cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      cronograma_tarefas: {
        Row: {
          categoria: string | null
          created_at: string | null
          data_inicio: string | null
          data_termino: string | null
          dependencias: string[] | null
          descricao: string | null
          duracao_dias: number | null
          id: string
          item_contrato_id: string | null
          nucleo: string | null
          ordem: number | null
          prioridade: string | null
          progresso: number | null
          projeto_id: string
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          duracao_dias?: number | null
          id?: string
          item_contrato_id?: string | null
          nucleo?: string | null
          ordem?: number | null
          prioridade?: string | null
          progresso?: number | null
          projeto_id: string
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          duracao_dias?: number | null
          id?: string
          item_contrato_id?: string | null
          nucleo?: string | null
          ordem?: number | null
          prioridade?: string | null
          progresso?: number | null
          projeto_id?: string
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_tarefas_item_contrato_id_fkey"
            columns: ["item_contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "cronograma_tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      deposito_estoque: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          custo_medio: number | null
          data_validade: string | null
          id: string
          local_id: string
          localizacao: string | null
          lote: string | null
          nucleo_id: string
          observacoes: string | null
          produto_id: string
          quantidade: number | null
          quantidade_disponivel: number | null
          quantidade_reservada: number | null
          valor_total: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          custo_medio?: number | null
          data_validade?: string | null
          id?: string
          local_id: string
          localizacao?: string | null
          lote?: string | null
          nucleo_id: string
          observacoes?: string | null
          produto_id: string
          quantidade?: number | null
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          valor_total?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          custo_medio?: number | null
          data_validade?: string | null
          id?: string
          local_id?: string
          localizacao?: string | null
          lote?: string | null
          nucleo_id?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number | null
          quantidade_disponivel?: number | null
          quantidade_reservada?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_estoque_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "deposito_locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      deposito_inventario_itens: {
        Row: {
          ajustado: boolean | null
          ajuste_id: string | null
          contado_em: string | null
          contado_por: string | null
          diferenca: number | null
          id: string
          inventario_id: string
          localizacao: string | null
          lote: string | null
          observacoes: string | null
          produto_id: string
          quantidade_contada: number | null
          quantidade_sistema: number | null
        }
        Insert: {
          ajustado?: boolean | null
          ajuste_id?: string | null
          contado_em?: string | null
          contado_por?: string | null
          diferenca?: number | null
          id?: string
          inventario_id: string
          localizacao?: string | null
          lote?: string | null
          observacoes?: string | null
          produto_id: string
          quantidade_contada?: number | null
          quantidade_sistema?: number | null
        }
        Update: {
          ajustado?: boolean | null
          ajuste_id?: string | null
          contado_em?: string | null
          contado_por?: string | null
          diferenca?: number | null
          id?: string
          inventario_id?: string
          localizacao?: string | null
          lote?: string | null
          observacoes?: string | null
          produto_id?: string
          quantidade_contada?: number | null
          quantidade_sistema?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_inventario_itens_ajuste_id_fkey"
            columns: ["ajuste_id"]
            isOneToOne: false
            referencedRelation: "deposito_movimentacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_inventario_id_fkey"
            columns: ["inventario_id"]
            isOneToOne: false
            referencedRelation: "deposito_inventarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventario_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      deposito_inventarios: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          criado_por: string | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          local_id: string
          nucleo_id: string
          numero: string
          observacoes: string | null
          responsavel_id: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          local_id: string
          nucleo_id: string
          numero: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          local_id?: string
          nucleo_id?: string
          numero?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_inventarios_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "deposito_locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_inventarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_inventarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      deposito_locais: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          cidade: string | null
          codigo: string
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          nucleo_id: string
          responsavel_id: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cidade?: string | null
          codigo: string
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          nucleo_id: string
          responsavel_id?: string | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cidade?: string | null
          codigo?: string
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          nucleo_id?: string
          responsavel_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_locais_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_locais_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_locais_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      deposito_movimentacoes: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          confirmado_em: string | null
          confirmado_por: string | null
          criado_em: string | null
          criado_por: string | null
          custo_unitario: number | null
          data_movimentacao: string | null
          data_validade: string | null
          documento_id: string | null
          documento_referencia: string | null
          documento_tipo: string | null
          id: string
          local_destino_id: string | null
          local_origem_id: string | null
          lote: string | null
          motivo: string | null
          nucleo_id: string
          numero: string
          observacoes: string | null
          produto_id: string
          quantidade: number
          status: string | null
          tipo: string
          valor_total: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          custo_unitario?: number | null
          data_movimentacao?: string | null
          data_validade?: string | null
          documento_id?: string | null
          documento_referencia?: string | null
          documento_tipo?: string | null
          id?: string
          local_destino_id?: string | null
          local_origem_id?: string | null
          lote?: string | null
          motivo?: string | null
          nucleo_id: string
          numero: string
          observacoes?: string | null
          produto_id: string
          quantidade: number
          status?: string | null
          tipo: string
          valor_total?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          confirmado_em?: string | null
          confirmado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          custo_unitario?: number | null
          data_movimentacao?: string | null
          data_validade?: string | null
          documento_id?: string | null
          documento_referencia?: string | null
          documento_tipo?: string | null
          id?: string
          local_destino_id?: string | null
          local_origem_id?: string | null
          lote?: string | null
          motivo?: string | null
          nucleo_id?: string
          numero?: string
          observacoes?: string | null
          produto_id?: string
          quantidade?: number
          status?: string | null
          tipo?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_movimentacoes_local_destino_id_fkey"
            columns: ["local_destino_id"]
            isOneToOne: false
            referencedRelation: "deposito_locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_local_origem_id_fkey"
            columns: ["local_origem_id"]
            isOneToOne: false
            referencedRelation: "deposito_locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      deposito_reservas: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          criado_por: string | null
          data_reserva: string | null
          data_validade: string | null
          id: string
          local_id: string
          nucleo_id: string
          observacoes: string | null
          origem_id: string
          produto_id: string
          quantidade: number
          status: string | null
          tipo_origem: string | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_reserva?: string | null
          data_validade?: string | null
          id?: string
          local_id: string
          nucleo_id: string
          observacoes?: string | null
          origem_id: string
          produto_id: string
          quantidade: number
          status?: string | null
          tipo_origem?: string | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_reserva?: string | null
          data_validade?: string | null
          id?: string
          local_id?: string
          nucleo_id?: string
          observacoes?: string | null
          origem_id?: string
          produto_id?: string
          quantidade?: number
          status?: string | null
          tipo_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_reservas_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "deposito_locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_reservas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_reservas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas_compartilhamentos: {
        Row: {
          acessos: number | null
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          conta_id: string | null
          criado_em: string
          criado_por: string | null
          destinatario_email: string | null
          destinatario_nome: string
          destinatario_tipo: string
          empresa_id: string
          exibir_contato: boolean
          exibir_dados_bancarios: boolean
          exibir_empresa: boolean
          exibir_endereco: boolean
          expira_em: string | null
          id: string
          limite_acessos: number | null
          token: string
          ultimo_acesso_em: string | null
          ultimo_acesso_ip: string | null
        }
        Insert: {
          acessos?: number | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          conta_id?: string | null
          criado_em?: string
          criado_por?: string | null
          destinatario_email?: string | null
          destinatario_nome: string
          destinatario_tipo: string
          empresa_id: string
          exibir_contato?: boolean
          exibir_dados_bancarios?: boolean
          exibir_empresa?: boolean
          exibir_endereco?: boolean
          expira_em?: string | null
          id?: string
          limite_acessos?: number | null
          token?: string
          ultimo_acesso_em?: string | null
          ultimo_acesso_ip?: string | null
        }
        Update: {
          acessos?: number | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          conta_id?: string | null
          criado_em?: string
          criado_por?: string | null
          destinatario_email?: string | null
          destinatario_nome?: string
          destinatario_tipo?: string
          empresa_id?: string
          exibir_contato?: boolean
          exibir_dados_bancarios?: boolean
          exibir_empresa?: boolean
          exibir_endereco?: boolean
          expira_em?: string | null
          id?: string
          limite_acessos?: number | null
          token?: string
          ultimo_acesso_em?: string | null
          ultimo_acesso_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_compartilhamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "empresas_contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_compartilhamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "view_compartilhamentos_completos"
            referencedColumns: ["conta_id"]
          },
          {
            foreignKeyName: "empresas_compartilhamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["conta_id"]
          },
          {
            foreignKeyName: "empresas_compartilhamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_compartilhamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_compartilhamentos_completos"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "empresas_compartilhamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      empresas_contas_bancarias: {
        Row: {
          agencia: string
          agencia_digito: string | null
          apelido: string | null
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito: string | null
          criado_em: string
          criado_por: string | null
          empresa_id: string
          id: string
          padrao: boolean | null
          pix_chave: string | null
          pix_tipo: string | null
          tipo: string | null
          tipo_conta: string
        }
        Insert: {
          agencia: string
          agencia_digito?: string | null
          apelido?: string | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          banco_codigo: string
          banco_nome: string
          conta: string
          conta_digito?: string | null
          criado_em?: string
          criado_por?: string | null
          empresa_id: string
          id?: string
          padrao?: boolean | null
          pix_chave?: string | null
          pix_tipo?: string | null
          tipo?: string | null
          tipo_conta: string
        }
        Update: {
          agencia?: string
          agencia_digito?: string | null
          apelido?: string | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          banco_codigo?: string
          banco_nome?: string
          conta?: string
          conta_digito?: string | null
          criado_em?: string
          criado_por?: string | null
          empresa_id?: string
          id?: string
          padrao?: boolean | null
          pix_chave?: string | null
          pix_tipo?: string | null
          tipo?: string | null
          tipo_conta?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_contas_bancarias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_contas_bancarias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_compartilhamentos_completos"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "empresas_contas_bancarias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      empresas_grupo: {
        Row: {
          agencia: string | null
          ativo: boolean
          atualizado_em: string
          atualizado_por: string | null
          bairro: string | null
          banco: string | null
          cep: string | null
          cidade: string | null
          cnae_principal: string | null
          cnae_principal_desc: string | null
          cnaes_secundarios: string | null
          cnpj: string
          complemento: string | null
          conta: string | null
          criado_em: string
          criado_por: string | null
          email: string | null
          empresa_pai_id: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logradouro: string | null
          nome_fantasia: string
          nucleo_id: string | null
          numero: string | null
          pais: string | null
          razao_social: string
          regime_apuracao: string | null
          regime_tributario: string | null
          telefone: string | null
          tipo: string
          tipo_conta: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          cnae_principal?: string | null
          cnae_principal_desc?: string | null
          cnaes_secundarios?: string | null
          cnpj: string
          complemento?: string | null
          conta?: string | null
          criado_em?: string
          criado_por?: string | null
          email?: string | null
          empresa_pai_id?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          nome_fantasia: string
          nucleo_id?: string | null
          numero?: string | null
          pais?: string | null
          razao_social: string
          regime_apuracao?: string | null
          regime_tributario?: string | null
          telefone?: string | null
          tipo: string
          tipo_conta?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          atualizado_em?: string
          atualizado_por?: string | null
          bairro?: string | null
          banco?: string | null
          cep?: string | null
          cidade?: string | null
          cnae_principal?: string | null
          cnae_principal_desc?: string | null
          cnaes_secundarios?: string | null
          cnpj?: string
          complemento?: string | null
          conta?: string | null
          criado_em?: string
          criado_por?: string | null
          email?: string | null
          empresa_pai_id?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          nome_fantasia?: string
          nucleo_id?: string | null
          numero?: string | null
          pais?: string | null
          razao_social?: string
          regime_apuracao?: string | null
          regime_tributario?: string | null
          telefone?: string | null
          tipo?: string
          tipo_conta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_grupo_empresa_pai_id_fkey"
            columns: ["empresa_pai_id"]
            isOneToOne: false
            referencedRelation: "empresas_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_grupo_empresa_pai_id_fkey"
            columns: ["empresa_pai_id"]
            isOneToOne: false
            referencedRelation: "view_compartilhamentos_completos"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "empresas_grupo_empresa_pai_id_fkey"
            columns: ["empresa_pai_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "empresas_grupo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_grupo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "empresas_grupo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      estagios_pipeline: {
        Row: {
          id: number
          nome: string
          ordem: number
        }
        Insert: {
          id?: number
          nome: string
          ordem: number
        }
        Update: {
          id?: number
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      faixas_vgv: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cota: number
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          valor_maximo: number | null
          valor_minimo: number
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cota: number
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          valor_maximo?: number | null
          valor_minimo?: number
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cota?: number
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          valor_maximo?: number | null
          valor_minimo?: number
        }
        Relationships: []
      }
      fin_categories: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          kind: string
          name: string
          nucleo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          kind: string
          name: string
          nucleo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          kind?: string
          name?: string
          nucleo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fin_nucleos: {
        Row: {
          ativo: boolean | null
          codigo: string
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fin_plano_contas: {
        Row: {
          ativo: boolean | null
          classe: string
          codigo: string
          created_at: string | null
          id: string
          nome: string
          nucleo_id: string | null
          ordem: number | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          classe: string
          codigo: string
          created_at?: string | null
          id?: string
          nome: string
          nucleo_id?: string | null
          ordem?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          classe?: string
          codigo?: string
          created_at?: string | null
          id?: string
          nome?: string
          nucleo_id?: string | null
          ordem?: number | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_plano_contas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "fin_nucleos"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_transactions: {
        Row: {
          amount: number | null
          category_id: string | null
          cleared: boolean | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          data: string | null
          descricao: string | null
          description: string | null
          empresa_id: string | null
          id: string
          obra_id: string | null
          occurred_at: string | null
          party_id: string | null
          project_id: string | null
          tipo: string
          type: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          cleared?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          data?: string | null
          descricao?: string | null
          description?: string | null
          empresa_id?: string | null
          id?: string
          obra_id?: string | null
          occurred_at?: string | null
          party_id?: string | null
          project_id?: string | null
          tipo: string
          type?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          cleared?: boolean | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          data?: string | null
          descricao?: string | null
          description?: string | null
          empresa_id?: string | null
          id?: string
          obra_id?: string | null
          occurred_at?: string | null
          party_id?: string | null
          project_id?: string | null
          tipo?: string
          type?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fin_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
          {
            foreignKeyName: "fin_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      finance_config: {
        Row: {
          key: string
          value: number | null
        }
        Insert: {
          key: string
          value?: number | null
        }
        Update: {
          key?: string
          value?: number | null
        }
        Relationships: []
      }
      financeiro_alertas: {
        Row: {
          enviado_em: string | null
          financeiro_id: string | null
          id: string
          mensagem: string | null
          tipo: string | null
        }
        Insert: {
          enviado_em?: string | null
          financeiro_id?: string | null
          id?: string
          mensagem?: string | null
          tipo?: string | null
        }
        Update: {
          enviado_em?: string | null
          financeiro_id?: string | null
          id?: string
          mensagem?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      financeiro_categorias: {
        Row: {
          ativa: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          cor: string | null
          criado_em: string | null
          criado_por: string | null
          icone: string | null
          id: string
          nome: string
          nucleo: string
          nucleo_id: string | null
          tipo: string
        }
        Insert: {
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cor?: string | null
          criado_em?: string | null
          criado_por?: string | null
          icone?: string | null
          id?: string
          nome: string
          nucleo?: string
          nucleo_id?: string | null
          tipo: string
        }
        Update: {
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cor?: string | null
          criado_em?: string | null
          criado_por?: string | null
          icone?: string | null
          id?: string
          nome?: string
          nucleo?: string
          nucleo_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_categorias_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_categorias_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_categorias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_categorias_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_categorias_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_categorias_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_categorias_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      financeiro_centros_custo: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          id: string
          nome: string
          nucleo: string
          nucleo_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome: string
          nucleo?: string
          nucleo_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          nucleo?: string
          nucleo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_centros_custo_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_centros_custo_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      financeiro_contas: {
        Row: {
          agencia: string | null
          ativa: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          banco: string | null
          conta: string | null
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          nucleo: string
          nucleo_id: string | null
          saldo_inicial: number | null
          tipo: string
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco?: string | null
          conta?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          nucleo?: string
          nucleo_id?: string | null
          saldo_inicial?: number | null
          tipo: string
        }
        Update: {
          agencia?: string | null
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          banco?: string | null
          conta?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          nucleo?: string
          nucleo_id?: string | null
          saldo_inicial?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_contas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_contas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      financeiro_contas_virtual: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cliente_id: string | null
          created_at: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          moeda: string | null
          parceiro_id: string | null
          referencia_id: string | null
          saldo: number | null
          saldo_atual: number | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cliente_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          moeda?: string | null
          parceiro_id?: string | null
          referencia_id?: string | null
          saldo?: number | null
          saldo_atual?: number | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cliente_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          moeda?: string | null
          parceiro_id?: string | null
          referencia_id?: string | null
          saldo?: number | null
          saldo_atual?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      financeiro_contas_virtual_lancamentos: {
        Row: {
          conta_virtual_id: string
          criado_em: string | null
          id: string
          origem: string | null
          referencia: string | null
          tipo: string
          valor: number
        }
        Insert: {
          conta_virtual_id: string
          criado_em?: string | null
          id?: string
          origem?: string | null
          referencia?: string | null
          tipo: string
          valor: number
        }
        Update: {
          conta_virtual_id?: string
          criado_em?: string | null
          id?: string
          origem?: string | null
          referencia?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_contas_virtual_lancamentos_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_virtual"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_virtual_lancamentos_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "vw_financeiro_contas_virtual_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_cronograma: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          criado_por: string | null
          data_realizacao: string | null
          data_vencimento: string
          descricao: string
          id: string
          nucleo: string | null
          nucleo_id: string | null
          observacoes: string | null
          parcela_id: string
          status: string | null
          valor_previsto: number
          valor_realizado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_realizacao?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          observacoes?: string | null
          parcela_id: string
          status?: string | null
          valor_previsto: number
          valor_realizado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_realizacao?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          observacoes?: string | null
          parcela_id?: string
          status?: string | null
          valor_previsto?: number
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_cronograma_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_cronograma_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "financeiro_parcelas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_formas_pagamento: {
        Row: {
          ativa: boolean | null
          atualizado_em: string | null
          atualizado_por: string | null
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          nucleo: string
          nucleo_id: string | null
          tipo: string | null
        }
        Insert: {
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          nucleo?: string
          nucleo_id?: string | null
          tipo?: string | null
        }
        Update: {
          ativa?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          nucleo?: string
          nucleo_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_formas_pagamento_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_formas_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      financeiro_importacao_itens: {
        Row: {
          categoria_id: string | null
          categoria_sugerida: string | null
          confianca: number | null
          contrato_id: string | null
          contrato_sugerido: string | null
          data_transacao: string
          descricao_formatada: string | null
          descricao_original: string
          duplicata_de: string | null
          id: string
          importacao_id: string
          lancamento_id: string | null
          observacoes: string | null
          pessoa_id: string | null
          pessoa_sugerida: string | null
          projeto_id: string | null
          projeto_sugerido: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: string | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          categoria_sugerida?: string | null
          confianca?: number | null
          contrato_id?: string | null
          contrato_sugerido?: string | null
          data_transacao: string
          descricao_formatada?: string | null
          descricao_original: string
          duplicata_de?: string | null
          id?: string
          importacao_id: string
          lancamento_id?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          pessoa_sugerida?: string | null
          projeto_id?: string | null
          projeto_sugerido?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string | null
          tipo: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          categoria_sugerida?: string | null
          confianca?: number | null
          contrato_id?: string | null
          contrato_sugerido?: string | null
          data_transacao?: string
          descricao_formatada?: string | null
          descricao_original?: string
          duplicata_de?: string | null
          id?: string
          importacao_id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          pessoa_id?: string | null
          pessoa_sugerida?: string | null
          projeto_id?: string | null
          projeto_sugerido?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_importacao_itens_importacao_id_fkey"
            columns: ["importacao_id"]
            isOneToOne: false
            referencedRelation: "financeiro_importacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_importacoes: {
        Row: {
          conta_bancaria: string | null
          criado_em: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          erro_mensagem: string | null
          id: string
          linhas_a_definir: number | null
          linhas_duplicadas: number | null
          linhas_erro: number | null
          linhas_importadas: number | null
          nome_arquivo: string
          processado_em: string | null
          status: string | null
          tamanho_bytes: number | null
          tipo_arquivo: string
          total_linhas: number | null
        }
        Insert: {
          conta_bancaria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          erro_mensagem?: string | null
          id?: string
          linhas_a_definir?: number | null
          linhas_duplicadas?: number | null
          linhas_erro?: number | null
          linhas_importadas?: number | null
          nome_arquivo: string
          processado_em?: string | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo: string
          total_linhas?: number | null
        }
        Update: {
          conta_bancaria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          erro_mensagem?: string | null
          id?: string
          linhas_a_definir?: number | null
          linhas_duplicadas?: number | null
          linhas_erro?: number | null
          linhas_importadas?: number | null
          nome_arquivo?: string
          processado_em?: string | null
          status?: string | null
          tamanho_bytes?: number | null
          tipo_arquivo?: string
          total_linhas?: number | null
        }
        Relationships: []
      }
      financeiro_lancamentos: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          categoria: string | null
          categoria_id: string | null
          centro_custo_id: string | null
          conta_bancaria_id: string | null
          conta_id: string | null
          contrato_id: string | null
          created_at: string | null
          criado_em: string | null
          criado_por: string | null
          data_competencia: string
          data_emissao: string
          data_pagamento: string | null
          descricao: string
          documento_numero: string | null
          documento_tipo: string | null
          forma_pagamento_id: string | null
          frequencia_recorrencia: string | null
          id: string
          is_entrada: boolean | null
          natureza: string
          nucleo: string | null
          nucleo_id: string | null
          numero: string | null
          numero_parcelas: number
          observacoes: string | null
          parcela_numero: number | null
          pessoa_id: string | null
          projeto_id: string | null
          proposta_id: string | null
          recorrente: boolean | null
          referencia_tipo:
            | Database["public"]["Enums"]["financeiro_referencia_tipo"]
            | null
          status: string | null
          tipo: string
          tipo_parcelamento: string | null
          total_parcelas: number | null
          unidade_negocio: string | null
          updated_at: string | null
          valor: number
          valor_acrescimo: number | null
          valor_desconto: number | null
          valor_liquido: number | null
          valor_total: number
          vencimento: string | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          conta_bancaria_id?: string | null
          conta_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_competencia?: string
          data_emissao?: string
          data_pagamento?: string | null
          descricao: string
          documento_numero?: string | null
          documento_tipo?: string | null
          forma_pagamento_id?: string | null
          frequencia_recorrencia?: string | null
          id?: string
          is_entrada?: boolean | null
          natureza?: string
          nucleo?: string | null
          nucleo_id?: string | null
          numero?: string | null
          numero_parcelas?: number
          observacoes?: string | null
          parcela_numero?: number | null
          pessoa_id?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          recorrente?: boolean | null
          referencia_tipo?:
            | Database["public"]["Enums"]["financeiro_referencia_tipo"]
            | null
          status?: string | null
          tipo: string
          tipo_parcelamento?: string | null
          total_parcelas?: number | null
          unidade_negocio?: string | null
          updated_at?: string | null
          valor?: number
          valor_acrescimo?: number | null
          valor_desconto?: number | null
          valor_liquido?: number | null
          valor_total: number
          vencimento?: string | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          categoria?: string | null
          categoria_id?: string | null
          centro_custo_id?: string | null
          conta_bancaria_id?: string | null
          conta_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_competencia?: string
          data_emissao?: string
          data_pagamento?: string | null
          descricao?: string
          documento_numero?: string | null
          documento_tipo?: string | null
          forma_pagamento_id?: string | null
          frequencia_recorrencia?: string | null
          id?: string
          is_entrada?: boolean | null
          natureza?: string
          nucleo?: string | null
          nucleo_id?: string | null
          numero?: string | null
          numero_parcelas?: number
          observacoes?: string | null
          parcela_numero?: number | null
          pessoa_id?: string | null
          projeto_id?: string | null
          proposta_id?: string | null
          recorrente?: boolean | null
          referencia_tipo?:
            | Database["public"]["Enums"]["financeiro_referencia_tipo"]
            | null
          status?: string | null
          tipo?: string
          tipo_parcelamento?: string | null
          total_parcelas?: number | null
          unidade_negocio?: string | null
          updated_at?: string | null
          valor?: number
          valor_acrescimo?: number | null
          valor_desconto?: number | null
          valor_liquido?: number | null
          valor_total?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "financeiro_centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_bancaria_id_fkey"
            columns: ["conta_bancaria_id"]
            isOneToOne: false
            referencedRelation: "contas_bancarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
          {
            foreignKeyName: "fk_financeiro_categoria"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_padroes_aprendidos: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          categoria_nome: string | null
          contrato_id: string | null
          criado_em: string | null
          criado_por: string | null
          id: string
          padrao_texto: string
          pessoa_id: string | null
          projeto_id: string | null
          projeto_nome: string | null
          tipo_match: string | null
          vezes_usado: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          categoria_nome?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          padrao_texto: string
          pessoa_id?: string | null
          projeto_id?: string | null
          projeto_nome?: string | null
          tipo_match?: string | null
          vezes_usado?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          categoria_nome?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          padrao_texto?: string
          pessoa_id?: string | null
          projeto_id?: string | null
          projeto_nome?: string | null
          tipo_match?: string | null
          vezes_usado?: number | null
        }
        Relationships: []
      }
      financeiro_parcelas: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          conta_pagamento_id: string | null
          criado_em: string | null
          criado_por: string | null
          data_competencia: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          forma_pagamento_id: string | null
          id: string
          lancamento_id: string
          nucleo: string
          nucleo_id: string | null
          numero_parcela: number
          observacoes: string | null
          status: string | null
          stripe_created_at: string | null
          stripe_customer_id: string | null
          stripe_paid_at: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_payment_link_url: string | null
          stripe_payment_status: string | null
          valor: number
          valor_desconto: number | null
          valor_final: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
          valor_pago: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          conta_pagamento_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_competencia?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          forma_pagamento_id?: string | null
          id?: string
          lancamento_id: string
          nucleo?: string
          nucleo_id?: string | null
          numero_parcela: number
          observacoes?: string | null
          status?: string | null
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_paid_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          stripe_payment_status?: string | null
          valor?: number
          valor_desconto?: number | null
          valor_final?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
          valor_pago?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          conta_pagamento_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_competencia?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          forma_pagamento_id?: string | null
          id?: string
          lancamento_id?: string
          nucleo?: string
          nucleo_id?: string | null
          numero_parcela?: number
          observacoes?: string | null
          status?: string | null
          stripe_created_at?: string | null
          stripe_customer_id?: string | null
          stripe_paid_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          stripe_payment_status?: string | null
          valor?: number
          valor_desconto?: number | null
          valor_final?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_parcelas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_conta_pagamento_id_fkey"
            columns: ["conta_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "financeiro_parcelas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      financeiro_projetos_resumo: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string
          created_at: string | null
          data_inicio: string | null
          data_previsao_termino: string | null
          nucleo: string | null
          numero: string | null
          numero_parcelas: number | null
          status: string | null
          updated_at: string | null
          valor_entrada: number | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id: string
          created_at?: string | null
          data_inicio?: string | null
          data_previsao_termino?: string | null
          nucleo?: string | null
          numero?: string | null
          numero_parcelas?: number | null
          status?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id?: string
          created_at?: string | null
          data_inicio?: string | null
          data_previsao_termino?: string | null
          nucleo?: string | null
          numero?: string | null
          numero_parcelas?: number | null
          status?: string | null
          updated_at?: string | null
          valor_entrada?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      financeiro_solicitacoes: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          observacoes: string | null
          solicitante_id: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          solicitante_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          solicitante_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_solicitacoes_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_solicitacoes_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_virtual_contas: {
        Row: {
          ativo: boolean | null
          contrato_id: string | null
          created_at: string | null
          empresa_id: string | null
          entidade_id: string
          entidade_tipo: string
          fee_percent: number | null
          id: string
          moeda: string | null
          nome: string
          nucleo: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo_fluxo: string | null
        }
        Insert: {
          ativo?: boolean | null
          contrato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          entidade_id: string
          entidade_tipo: string
          fee_percent?: number | null
          id?: string
          moeda?: string | null
          nome: string
          nucleo?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo_fluxo?: string | null
        }
        Update: {
          ativo?: boolean | null
          contrato_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          entidade_id?: string
          entidade_tipo?: string
          fee_percent?: number | null
          id?: string
          moeda?: string | null
          nome?: string
          nucleo?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo_fluxo?: string | null
        }
        Relationships: []
      }
      financeiro_virtual_fees: {
        Row: {
          base_valor: number
          conta_virtual_id: string | null
          data_registro: string | null
          id: string
          origem: string | null
          origem_id: string | null
          percentual: number
          status: string | null
          valor_fee: number | null
        }
        Insert: {
          base_valor: number
          conta_virtual_id?: string | null
          data_registro?: string | null
          id?: string
          origem?: string | null
          origem_id?: string | null
          percentual?: number
          status?: string | null
          valor_fee?: number | null
        }
        Update: {
          base_valor?: number
          conta_virtual_id?: string | null
          data_registro?: string | null
          id?: string
          origem?: string | null
          origem_id?: string | null
          percentual?: number
          status?: string | null
          valor_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_virtual_fees_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "financeiro_virtual_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_virtual_fees_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "vw_financeiro_virtual_resumo"
            referencedColumns: ["conta_virtual_id"]
          },
          {
            foreignKeyName: "financeiro_virtual_fees_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "vw_financeiro_virtual_saldos"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_virtual_movimentos: {
        Row: {
          conta_virtual_id: string
          created_at: string | null
          data_movimento: string
          descricao: string
          id: string
          origem: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          valor: number
        }
        Insert: {
          conta_virtual_id: string
          created_at?: string | null
          data_movimento?: string
          descricao: string
          id?: string
          origem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          valor: number
        }
        Update: {
          conta_virtual_id?: string
          created_at?: string | null
          data_movimento?: string
          descricao?: string
          id?: string
          origem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_virtual_movimentos_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "financeiro_virtual_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_virtual_movimentos_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "vw_financeiro_virtual_resumo"
            referencedColumns: ["conta_virtual_id"]
          },
          {
            foreignKeyName: "financeiro_virtual_movimentos_conta_virtual_id_fkey"
            columns: ["conta_virtual_id"]
            isOneToOne: false
            referencedRelation: "vw_financeiro_virtual_saldos"
            referencedColumns: ["id"]
          },
        ]
      }
      fluxo_financeiro_compras: {
        Row: {
          categoria: string | null
          cliente_nome: string | null
          codigo: string
          created_at: string | null
          data_registro: string | null
          descricao: string | null
          fornecedor: string | null
          id: string
          lista_compra_id: string | null
          projeto_id: string | null
          status: string | null
          taxa_fee_percent: number | null
          tipo_compra: string
          tipo_conta: string
          updated_at: string | null
          valor_bruto: number
          valor_fee: number | null
          valor_liquido: number | null
        }
        Insert: {
          categoria?: string | null
          cliente_nome?: string | null
          codigo: string
          created_at?: string | null
          data_registro?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          lista_compra_id?: string | null
          projeto_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra: string
          tipo_conta: string
          updated_at?: string | null
          valor_bruto: number
          valor_fee?: number | null
          valor_liquido?: number | null
        }
        Update: {
          categoria?: string | null
          cliente_nome?: string | null
          codigo?: string
          created_at?: string | null
          data_registro?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          lista_compra_id?: string | null
          projeto_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          updated_at?: string | null
          valor_bruto?: number
          valor_fee?: number | null
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_financeiro_compras_lista_compra_id_fkey"
            columns: ["lista_compra_id"]
            isOneToOne: false
            referencedRelation: "projeto_lista_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_financeiro_compras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_compras"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          canal: string
          criado_em: string | null
          data_disparo: string
          id: string
          mensagem: string
          oportunidade_id: string
          resposta: string | null
          status: string | null
          tentativas: number | null
        }
        Insert: {
          canal: string
          criado_em?: string | null
          data_disparo: string
          id?: string
          mensagem: string
          oportunidade_id: string
          resposta?: string | null
          status?: string | null
          tentativas?: number | null
        }
        Update: {
          canal?: string
          criado_em?: string | null
          data_disparo?: string
          id?: string
          mensagem?: string
          oportunidade_id?: string
          resposta?: string | null
          status?: string | null
          tentativas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_followup_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_followup_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_followup_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_followups_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_followups_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_followups_oportunidade"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_categoria_vinculo: {
        Row: {
          categoria_id: string
          criado_em: string | null
          fornecedor_id: string
          id: string
          principal: boolean | null
        }
        Insert: {
          categoria_id: string
          criado_em?: string | null
          fornecedor_id: string
          id?: string
          principal?: boolean | null
        }
        Update: {
          categoria_id?: string
          criado_em?: string | null
          fornecedor_id?: string
          id?: string
          principal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_categoria_vinculo_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fornecedor_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_categoria_vinculo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      fornecedor_categorias: {
        Row: {
          ativo: boolean | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fornecedor_servico_parcelas: {
        Row: {
          comprovante_url: string | null
          condicao: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          lancamento_id: string | null
          numero_parcela: number
          servico_id: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          comprovante_url?: string | null
          condicao?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          lancamento_id?: string | null
          numero_parcela: number
          servico_id: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          comprovante_url?: string | null
          condicao?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          lancamento_id?: string | null
          numero_parcela?: number
          servico_id?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_servico_parcelas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "fornecedor_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_servicos: {
        Row: {
          atualizado_em: string | null
          categoria_id: string | null
          condicoes_pagamento: string | null
          cotacao_id: string | null
          criado_em: string | null
          criado_por: string | null
          data_conclusao: string | null
          data_contratacao: string
          data_fim_prevista: string | null
          data_inicio_prevista: string | null
          descricao: string
          fornecedor_id: string
          garantia_meses: number | null
          id: string
          percentual_execucao: number | null
          projeto_id: string
          proposta_id: string | null
          status:
            | Database["public"]["Enums"]["status_servico_contratado"]
            | null
          valor_contratado: number
        }
        Insert: {
          atualizado_em?: string | null
          categoria_id?: string | null
          condicoes_pagamento?: string | null
          cotacao_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_contratacao?: string
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          descricao: string
          fornecedor_id: string
          garantia_meses?: number | null
          id?: string
          percentual_execucao?: number | null
          projeto_id: string
          proposta_id?: string | null
          status?:
            | Database["public"]["Enums"]["status_servico_contratado"]
            | null
          valor_contratado: number
        }
        Update: {
          atualizado_em?: string | null
          categoria_id?: string | null
          condicoes_pagamento?: string | null
          cotacao_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_contratacao?: string
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          descricao?: string
          fornecedor_id?: string
          garantia_meses?: number | null
          id?: string
          percentual_execucao?: number | null
          projeto_id?: string
          proposta_id?: string | null
          status?:
            | Database["public"]["Enums"]["status_servico_contratado"]
            | null
          valor_contratado?: number
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fornecedor_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "cotacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_cotacao_id_fkey"
            columns: ["cotacao_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "cotacao_propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedor_servicos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "vw_cotacoes_fornecedor"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          categoria: string | null
          cnpj: string | null
          criado_em: string | null
          email: string | null
          id: string
          link_origem: string | null
          logo_url: string | null
          nome: string
          observacoes: string | null
          site: string | null
          telefone: string | null
        }
        Insert: {
          categoria?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          link_origem?: string | null
          logo_url?: string | null
          nome: string
          observacoes?: string | null
          site?: string | null
          telefone?: string | null
        }
        Update: {
          categoria?: string | null
          cnpj?: string | null
          criado_em?: string | null
          email?: string | null
          id?: string
          link_origem?: string | null
          logo_url?: string | null
          nome?: string
          observacoes?: string | null
          site?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      frases_motivacionais: {
        Row: {
          ativo: boolean | null
          autor: string | null
          categoria: string | null
          created_at: string | null
          frase: string
          id: string
        }
        Insert: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          created_at?: string | null
          frase: string
          id?: string
        }
        Update: {
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          created_at?: string | null
          frase?: string
          id?: string
        }
        Relationships: []
      }
      juridico_auditoria: {
        Row: {
          acao: string
          created_at: string | null
          dados_antes: Json | null
          dados_depois: Json | null
          entidade: string
          entidade_id: string
          id: string
          ip_address: string | null
          observacao: string | null
          user_agent: string | null
          usuario_id: string | null
          usuario_nome: string | null
          usuario_perfil: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade: string
          entidade_id: string
          id?: string
          ip_address?: string | null
          observacao?: string | null
          user_agent?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
          usuario_perfil?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade?: string
          entidade_id?: string
          id?: string
          ip_address?: string | null
          observacao?: string | null
          user_agent?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
          usuario_perfil?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "juridico_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      juridico_clausulas: {
        Row: {
          ativa: boolean | null
          codigo: string
          conteudo_html: string
          created_at: string | null
          criado_por: string | null
          id: string
          modelo_id: string | null
          nucleo: string | null
          numero_ordem: number | null
          obrigatoria: boolean | null
          tipo: string
          titulo: string
          updated_at: string | null
          variaveis: Json | null
        }
        Insert: {
          ativa?: boolean | null
          codigo: string
          conteudo_html: string
          created_at?: string | null
          criado_por?: string | null
          id?: string
          modelo_id?: string | null
          nucleo?: string | null
          numero_ordem?: number | null
          obrigatoria?: boolean | null
          tipo: string
          titulo: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Update: {
          ativa?: boolean | null
          codigo?: string
          conteudo_html?: string
          created_at?: string | null
          criado_por?: string | null
          id?: string
          modelo_id?: string | null
          nucleo?: string | null
          numero_ordem?: number | null
          obrigatoria?: boolean | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "juridico_clausulas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_clausulas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_clausulas_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "juridico_modelos_contrato"
            referencedColumns: ["id"]
          },
        ]
      }
      juridico_memorial_executivo: {
        Row: {
          arquitetura: Json | null
          contrato_id: string | null
          created_at: string | null
          engenharia: Json | null
          id: string
          marcenaria: Json | null
          materiais: Json | null
          produtos: Json | null
          snapshot_data: Json | null
          snapshot_gerado_em: string | null
          texto_clausula_objeto: string | null
          updated_at: string | null
        }
        Insert: {
          arquitetura?: Json | null
          contrato_id?: string | null
          created_at?: string | null
          engenharia?: Json | null
          id?: string
          marcenaria?: Json | null
          materiais?: Json | null
          produtos?: Json | null
          snapshot_data?: Json | null
          snapshot_gerado_em?: string | null
          texto_clausula_objeto?: string | null
          updated_at?: string | null
        }
        Update: {
          arquitetura?: Json | null
          contrato_id?: string | null
          created_at?: string | null
          engenharia?: Json | null
          id?: string
          marcenaria?: Json | null
          materiais?: Json | null
          produtos?: Json | null
          snapshot_data?: Json | null
          snapshot_gerado_em?: string | null
          texto_clausula_objeto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "juridico_memorial_executivo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_memorial_executivo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "juridico_memorial_executivo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      juridico_modelos_contrato: {
        Row: {
          aprovado_por: string | null
          ativo: boolean | null
          clausulas: Json | null
          codigo: string
          conteudo_html: string
          created_at: string | null
          criado_por: string | null
          data_aprovacao: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          nome: string
          nucleo: string
          prazo_execucao_padrao: number | null
          prorrogacao_padrao: number | null
          status: string | null
          updated_at: string | null
          variaveis_obrigatorias: Json | null
          versao: number | null
          versao_texto: string | null
        }
        Insert: {
          aprovado_por?: string | null
          ativo?: boolean | null
          clausulas?: Json | null
          codigo: string
          conteudo_html: string
          created_at?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          nucleo: string
          prazo_execucao_padrao?: number | null
          prorrogacao_padrao?: number | null
          status?: string | null
          updated_at?: string | null
          variaveis_obrigatorias?: Json | null
          versao?: number | null
          versao_texto?: string | null
        }
        Update: {
          aprovado_por?: string | null
          ativo?: boolean | null
          clausulas?: Json | null
          codigo?: string
          conteudo_html?: string
          created_at?: string | null
          criado_por?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          nucleo?: string
          prazo_execucao_padrao?: number | null
          prorrogacao_padrao?: number | null
          status?: string | null
          updated_at?: string | null
          variaveis_obrigatorias?: Json | null
          versao?: number | null
          versao_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "juridico_modelos_contrato_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_modelos_contrato_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_modelos_contrato_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_modelos_contrato_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      juridico_variaveis: {
        Row: {
          ativa: boolean | null
          campo_origem: string | null
          categoria: string
          codigo: string
          created_at: string | null
          descricao: string | null
          exemplo: string | null
          formato: string | null
          id: string
          nome: string
          tabela_origem: string | null
        }
        Insert: {
          ativa?: boolean | null
          campo_origem?: string | null
          categoria: string
          codigo: string
          created_at?: string | null
          descricao?: string | null
          exemplo?: string | null
          formato?: string | null
          id?: string
          nome: string
          tabela_origem?: string | null
        }
        Update: {
          ativa?: boolean | null
          campo_origem?: string | null
          categoria?: string
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          exemplo?: string | null
          formato?: string | null
          id?: string
          nome?: string
          tabela_origem?: string | null
        }
        Relationships: []
      }
      juridico_versoes_modelo: {
        Row: {
          alterado_por: string | null
          clausulas: Json | null
          conteudo_html: string
          created_at: string | null
          id: string
          modelo_id: string | null
          motivo_alteracao: string | null
          variaveis_obrigatorias: Json | null
          versao: number
          versao_texto: string | null
        }
        Insert: {
          alterado_por?: string | null
          clausulas?: Json | null
          conteudo_html: string
          created_at?: string | null
          id?: string
          modelo_id?: string | null
          motivo_alteracao?: string | null
          variaveis_obrigatorias?: Json | null
          versao: number
          versao_texto?: string | null
        }
        Update: {
          alterado_por?: string | null
          clausulas?: Json | null
          conteudo_html?: string
          created_at?: string | null
          id?: string
          modelo_id?: string | null
          motivo_alteracao?: string | null
          variaveis_obrigatorias?: Json | null
          versao?: number
          versao_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "juridico_versoes_modelo_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_versoes_modelo_alterado_por_fkey"
            columns: ["alterado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "juridico_versoes_modelo_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "juridico_modelos_contrato"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras_complementares: {
        Row: {
          ativo: boolean | null
          categoria_base: string | null
          categoria_complemento: string | null
          complemento_descricao: string
          complemento_id: string | null
          created_at: string | null
          id: string
          obrigatoriedade: string | null
          preco_referencia: number | null
          produto_base_id: string | null
          qtd_por_unidade: number
          tipo: string | null
          unidade_calculo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_base?: string | null
          categoria_complemento?: string | null
          complemento_descricao: string
          complemento_id?: string | null
          created_at?: string | null
          id?: string
          obrigatoriedade?: string | null
          preco_referencia?: number | null
          produto_base_id?: string | null
          qtd_por_unidade?: number
          tipo?: string | null
          unidade_calculo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_base?: string | null
          categoria_complemento?: string | null
          complemento_descricao?: string
          complemento_id?: string | null
          created_at?: string | null
          id?: string
          obrigatoriedade?: string | null
          preco_referencia?: number | null
          produto_base_id?: string | null
          qtd_por_unidade?: number
          tipo?: string | null
          unidade_calculo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_complementares_complemento_id_fkey"
            columns: ["complemento_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_complemento_id_fkey"
            columns: ["complemento_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_complemento_id_fkey"
            columns: ["complemento_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_complemento_id_fkey"
            columns: ["complemento_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_complemento_id_fkey"
            columns: ["complemento_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_produto_base_id_fkey"
            columns: ["produto_base_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_produto_base_id_fkey"
            columns: ["produto_base_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_produto_base_id_fkey"
            columns: ["produto_base_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_produto_base_id_fkey"
            columns: ["produto_base_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_complementares_produto_base_id_fkey"
            columns: ["produto_base_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras_fluxo: {
        Row: {
          categoria: string | null
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          data: string
          data_nf: string | null
          descricao: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string
          lancamento_id: string | null
          lista_compra_id: string | null
          numero_nf: string | null
          observacoes: string | null
          projeto_id: string | null
          status: string | null
          taxa_fee_percent: number | null
          tipo_compra: string
          tipo_conta: string
          updated_at: string | null
          valor_bruto: number
          valor_fee: number | null
          valor_liquido: number | null
        }
        Insert: {
          categoria?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          data_nf?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          lancamento_id?: string | null
          lista_compra_id?: string | null
          numero_nf?: string | null
          observacoes?: string | null
          projeto_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra: string
          tipo_conta: string
          updated_at?: string | null
          valor_bruto: number
          valor_fee?: number | null
          valor_liquido?: number | null
        }
        Update: {
          categoria?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          data_nf?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          lancamento_id?: string | null
          lista_compra_id?: string | null
          numero_nf?: string | null
          observacoes?: string | null
          projeto_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          updated_at?: string | null
          valor_bruto?: number
          valor_fee?: number | null
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_lista_compra_id_fkey"
            columns: ["lista_compra_id"]
            isOneToOne: false
            referencedRelation: "lista_compras_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_lista_compra_id_fkey"
            columns: ["lista_compra_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_completa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "lista_compras_fluxo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras_itens: {
        Row: {
          ambiente: string | null
          categoria: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          data_aprovacao: string | null
          data_compra: string | null
          data_entrega: string | null
          descricao: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string
          imagem_url: string | null
          is_complementar: boolean | null
          item: string
          item_pai_id: string | null
          link_produto: string | null
          numero_nf: string | null
          observacoes: string | null
          preco_unit: number
          pricelist_item_id: string | null
          projeto_id: string | null
          qtd_compra: number
          quantitativo_id: string | null
          status: string | null
          taxa_fee_percent: number | null
          tipo_compra: string
          tipo_conta: string
          unidade: string | null
          updated_at: string | null
          updated_by: string | null
          valor_fee: number | null
          valor_total: number | null
        }
        Insert: {
          ambiente?: string | null
          categoria?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_compra?: string | null
          data_entrega?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          imagem_url?: string | null
          is_complementar?: boolean | null
          item: string
          item_pai_id?: string | null
          link_produto?: string | null
          numero_nf?: string | null
          observacoes?: string | null
          preco_unit?: number
          pricelist_item_id?: string | null
          projeto_id?: string | null
          qtd_compra: number
          quantitativo_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_fee?: number | null
          valor_total?: number | null
        }
        Update: {
          ambiente?: string | null
          categoria?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_compra?: string | null
          data_entrega?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          imagem_url?: string | null
          is_complementar?: boolean | null
          item?: string
          item_pai_id?: string | null
          link_produto?: string | null
          numero_nf?: string | null
          observacoes?: string | null
          preco_unit?: number
          pricelist_item_id?: string | null
          projeto_id?: string | null
          qtd_compra?: number
          quantitativo_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_fee?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_item_pai_id_fkey"
            columns: ["item_pai_id"]
            isOneToOne: false
            referencedRelation: "lista_compras_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_item_pai_id_fkey"
            columns: ["item_pai_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_completa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_quantitativo_id_fkey"
            columns: ["quantitativo_id"]
            isOneToOne: false
            referencedRelation: "lista_compras_quantitativo"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras_obra: {
        Row: {
          analise_id: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string | null
          contrato_id: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          id: string
          numero: string | null
          orcamento_id: string | null
          proposta_id: string | null
          status: string | null
          titulo: string
          total_itens: number | null
          valor_aprovado: number | null
          valor_estimado: number | null
        }
        Insert: {
          analise_id?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          numero?: string | null
          orcamento_id?: string | null
          proposta_id?: string | null
          status?: string | null
          titulo: string
          total_itens?: number | null
          valor_aprovado?: number | null
          valor_estimado?: number | null
        }
        Update: {
          analise_id?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          id?: string
          numero?: string | null
          orcamento_id?: string | null
          proposta_id?: string | null
          status?: string | null
          titulo?: string
          total_itens?: number | null
          valor_aprovado?: number | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_obra_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_analise_id_fkey"
            columns: ["analise_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_obra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_obra_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      lista_compras_obra_itens: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string
          lista_id: string | null
          observacoes: string | null
          ordem: number | null
          preco_aprovado: number | null
          preco_comprado: number | null
          preco_estimado: number | null
          pricelist_item_id: string | null
          quantidade_aprovada: number | null
          quantidade_comprada: number | null
          quantidade_necessaria: number
          status: string | null
          tipo_item: string | null
          unidade: string | null
          urgente: boolean | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao: string
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          lista_id?: string | null
          observacoes?: string | null
          ordem?: number | null
          preco_aprovado?: number | null
          preco_comprado?: number | null
          preco_estimado?: number | null
          pricelist_item_id?: string | null
          quantidade_aprovada?: number | null
          quantidade_comprada?: number | null
          quantidade_necessaria: number
          status?: string | null
          tipo_item?: string | null
          unidade?: string | null
          urgente?: boolean | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          id?: string
          lista_id?: string | null
          observacoes?: string | null
          ordem?: number | null
          preco_aprovado?: number | null
          preco_comprado?: number | null
          preco_estimado?: number | null
          pricelist_item_id?: string | null
          quantidade_aprovada?: number | null
          quantidade_comprada?: number | null
          quantidade_necessaria?: number
          status?: string | null
          tipo_item?: string | null
          unidade?: string | null
          urgente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "lista_compras_obra_itens_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "lista_compras_obra"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras_quantitativo: {
        Row: {
          ambiente: string
          aplicacao: string | null
          assunto: string | null
          codigo_fabricante: string | null
          contrato_id: string | null
          created_at: string | null
          descricao_projeto: string
          fabricante: string | null
          fornecedor: string | null
          id: string
          modelo: string | null
          observacoes: string | null
          pricelist_item_id: string | null
          projeto_id: string | null
          qtd_compra: number | null
          qtd_projeto: number
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ambiente: string
          aplicacao?: string | null
          assunto?: string | null
          codigo_fabricante?: string | null
          contrato_id?: string | null
          created_at?: string | null
          descricao_projeto: string
          fabricante?: string | null
          fornecedor?: string | null
          id?: string
          modelo?: string | null
          observacoes?: string | null
          pricelist_item_id?: string | null
          projeto_id?: string | null
          qtd_compra?: number | null
          qtd_projeto: number
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ambiente?: string
          aplicacao?: string | null
          assunto?: string | null
          codigo_fabricante?: string | null
          contrato_id?: string | null
          created_at?: string | null
          descricao_projeto?: string
          fabricante?: string | null
          fornecedor?: string | null
          id?: string
          modelo?: string | null
          observacoes?: string | null
          pricelist_item_id?: string | null
          projeto_id?: string | null
          qtd_compra?: number | null
          qtd_projeto?: number
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_quantitativo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "lista_compras_quantitativo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_cron: {
        Row: {
          criado_em: string | null
          detalhes: Json | null
          erro_mensagem: string | null
          id: string
          job_name: string
          registros_afetados: number | null
          status: string
          tempo_execucao_ms: number | null
        }
        Insert: {
          criado_em?: string | null
          detalhes?: Json | null
          erro_mensagem?: string | null
          id?: string
          job_name: string
          registros_afetados?: number | null
          status: string
          tempo_execucao_ms?: number | null
        }
        Update: {
          criado_em?: string | null
          detalhes?: Json | null
          erro_mensagem?: string | null
          id?: string
          job_name?: string
          registros_afetados?: number | null
          status?: string
          tempo_execucao_ms?: number | null
        }
        Relationships: []
      }
      marcenaria_arquivos: {
        Row: {
          criado_em: string | null
          id: string
          item_id: string | null
          nome_arquivo: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          item_id?: string | null
          nome_arquivo?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          item_id?: string | null
          nome_arquivo?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marcenaria_arquivos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marcenaria_itens"
            referencedColumns: ["id"]
          },
        ]
      }
      marcenaria_itens: {
        Row: {
          acabamento: string | null
          altura: number | null
          ambiente: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          largura: number | null
          obra_id: string | null
          observacoes: string | null
          profundidade: number | null
          quantidade: number | null
          responsavel: string | null
          status: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          acabamento?: string | null
          altura?: number | null
          ambiente?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          largura?: number | null
          obra_id?: string | null
          observacoes?: string | null
          profundidade?: number | null
          quantidade?: number | null
          responsavel?: string | null
          status?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          acabamento?: string | null
          altura?: number | null
          ambiente?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          largura?: number | null
          obra_id?: string | null
          observacoes?: string | null
          profundidade?: number | null
          quantidade?: number | null
          responsavel?: string | null
          status?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marcenaria_itens_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcenaria_itens_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      memorial_acabamentos: {
        Row: {
          ambiente: string
          assunto: string
          categoria: string
          codigo_fabricante: string | null
          created_at: string | null
          created_by: string | null
          fabricante: string | null
          id: string
          item: string
          modelo: string | null
          observacoes: string | null
          ordem: number | null
          preco_total: number | null
          preco_unitario: number | null
          pricelist_item_id: string | null
          projeto_id: string | null
          quantidade: number | null
          status: string | null
          unidade: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ambiente: string
          assunto: string
          categoria: string
          codigo_fabricante?: string | null
          created_at?: string | null
          created_by?: string | null
          fabricante?: string | null
          id?: string
          item: string
          modelo?: string | null
          observacoes?: string | null
          ordem?: number | null
          preco_total?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ambiente?: string
          assunto?: string
          categoria?: string
          codigo_fabricante?: string | null
          created_at?: string | null
          created_by?: string | null
          fabricante?: string | null
          id?: string
          item?: string
          modelo?: string | null
          observacoes?: string | null
          ordem?: number | null
          preco_total?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas_diarias: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          dados: Json | null
          data: string
          id: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          dados?: Json | null
          data: string
          id?: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          dados?: Json | null
          data?: string
          id?: string
        }
        Relationships: []
      }
      modelos_orcamento: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria: string | null
          codigo: string
          cor_primaria: string | null
          cor_secundaria: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          icone: string | null
          id: string
          nucleo: string
          ordem: number | null
          popular: boolean | null
          tags: string[] | null
          titulo: string
          vezes_utilizado: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nucleo?: string
          ordem?: number | null
          popular?: boolean | null
          tags?: string[] | null
          titulo: string
          vezes_utilizado?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria?: string | null
          codigo?: string
          cor_primaria?: string | null
          cor_secundaria?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nucleo?: string
          ordem?: number | null
          popular?: boolean | null
          tags?: string[] | null
          titulo?: string
          vezes_utilizado?: number | null
        }
        Relationships: []
      }
      modelos_orcamento_categorias: {
        Row: {
          cor: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          modelo_id: string | null
          nome: string
          ordem: number | null
        }
        Insert: {
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          modelo_id?: string | null
          nome: string
          ordem?: number | null
        }
        Update: {
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          modelo_id?: string | null
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_orcamento_categorias_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_orcamento_itens: {
        Row: {
          categoria_id: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string
          formula_quantidade: string | null
          id: string
          modelo_id: string | null
          obrigatorio: boolean | null
          ordem: number | null
          preco_unitario: number | null
          pricelist_item_id: string | null
          quantidade_padrao: number | null
          tipo_item: string | null
          unidade: string | null
        }
        Insert: {
          categoria_id?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao: string
          formula_quantidade?: string | null
          id?: string
          modelo_id?: string | null
          obrigatorio?: boolean | null
          ordem?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          quantidade_padrao?: number | null
          tipo_item?: string | null
          unidade?: string | null
        }
        Update: {
          categoria_id?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string
          formula_quantidade?: string | null
          id?: string
          modelo_id?: string | null
          obrigatorio?: boolean | null
          ordem?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          quantidade_padrao?: number | null
          tipo_item?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_orcamento_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "modelos_orcamento_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modelos_orcamento_itens_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelos_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          criado_em: string | null
          dados: Json | null
          destinatario_id: string | null
          id: string
          lida: boolean | null
          lida_em: string | null
          mensagem: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          criado_em?: string | null
          dados?: Json | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          criado_em?: string | null
          dados?: Json | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          mensagem?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      notificacoes_sistema: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          dados: Json | null
          id: string
          lida: boolean | null
          lida_em: string | null
          lida_por: string | null
          mensagem: string | null
          pessoa_id: string | null
          prioridade: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          dados?: Json | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          lida_por?: string | null
          mensagem?: string | null
          pessoa_id?: string | null
          prioridade?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          dados?: Json | null
          id?: string
          lida?: boolean | null
          lida_em?: string | null
          lida_por?: string | null
          mensagem?: string | null
          pessoa_id?: string | null
          prioridade?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      nucleos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string | null
          conta_entrada_id: string | null
          conta_saida_id: string | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          descricao_cor: string | null
          id: string
          modelo_financeiro: string | null
          nome: string
          ordem: number | null
          ordem_exibicao: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string | null
          conta_entrada_id?: string | null
          conta_saida_id?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_cor?: string | null
          id?: string
          modelo_financeiro?: string | null
          nome: string
          ordem?: number | null
          ordem_exibicao?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string | null
          conta_entrada_id?: string | null
          conta_saida_id?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_cor?: string | null
          id?: string
          modelo_financeiro?: string | null
          nome?: string
          ordem?: number | null
          ordem_exibicao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nucleos_conta_entrada_id_fkey"
            columns: ["conta_entrada_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_conta_saida_id_fkey"
            columns: ["conta_saida_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleos_colunas: {
        Row: {
          atualizado_em: string | null
          cor: string | null
          criado_em: string | null
          id: string
          nucleo: string
          ordem: number
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nucleo: string
          ordem?: number
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          id?: string
          nucleo?: string
          ordem?: number
          titulo?: string
        }
        Relationships: []
      }
      nucleos_oportunidades_posicoes: {
        Row: {
          atualizado_em: string | null
          coluna_id: string
          criado_em: string | null
          id: string
          nucleo: string
          oportunidade_id: string
          ordem: number
        }
        Insert: {
          atualizado_em?: string | null
          coluna_id: string
          criado_em?: string | null
          id?: string
          nucleo: string
          oportunidade_id: string
          ordem?: number
        }
        Update: {
          atualizado_em?: string | null
          coluna_id?: string
          criado_em?: string | null
          id?: string
          nucleo?: string
          oportunidade_id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "nucleos_oportunidades_posicoes_coluna_id_fkey"
            columns: ["coluna_id"]
            isOneToOne: false
            referencedRelation: "nucleos_colunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_oportunidades_posicoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nucleos_oportunidades_posicoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "nucleos_oportunidades_posicoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_checklist_itens: {
        Row: {
          checklist_id: string
          concluido: boolean | null
          concluido_por: string | null
          criado_em: string | null
          data_conclusao: string | null
          descricao: string
          id: string
          obrigatorio: boolean | null
          observacao: string | null
          ordem: number | null
        }
        Insert: {
          checklist_id: string
          concluido?: boolean | null
          concluido_por?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          descricao: string
          id?: string
          obrigatorio?: boolean | null
          observacao?: string | null
          ordem?: number | null
        }
        Update: {
          checklist_id?: string
          concluido?: boolean | null
          concluido_por?: string | null
          criado_em?: string | null
          data_conclusao?: string | null
          descricao?: string
          id?: string
          obrigatorio?: boolean | null
          observacao?: string | null
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obra_checklist_itens_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "obra_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_checklists: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          etapa: string | null
          id: string
          projeto_id: string
          titulo: string
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          etapa?: string | null
          id?: string
          projeto_id: string
          titulo: string
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          etapa?: string | null
          id?: string
          projeto_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_checklists_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_checklists_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "obra_checklists_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      obra_registros: {
        Row: {
          atualizado_em: string | null
          clima: string | null
          colaborador_id: string
          criado_em: string | null
          data_registro: string
          descricao: string | null
          equipe_presente: number | null
          etapa_cronograma_id: string | null
          id: string
          observacoes: string | null
          pendencias: string | null
          percentual_avanco: number | null
          projeto_id: string
          titulo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          clima?: string | null
          colaborador_id: string
          criado_em?: string | null
          data_registro?: string
          descricao?: string | null
          equipe_presente?: number | null
          etapa_cronograma_id?: string | null
          id?: string
          observacoes?: string | null
          pendencias?: string | null
          percentual_avanco?: number | null
          projeto_id: string
          titulo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          clima?: string | null
          colaborador_id?: string
          criado_em?: string | null
          data_registro?: string
          descricao?: string | null
          equipe_presente?: number | null
          etapa_cronograma_id?: string | null
          id?: string
          observacoes?: string | null
          pendencias?: string | null
          percentual_avanco?: number | null
          projeto_id?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "obra_registros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obra_registros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "obra_registros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      obra_registros_fotos: {
        Row: {
          arquivo_url: string
          criado_em: string | null
          descricao: string | null
          id: string
          ordem: number | null
          registro_id: string
        }
        Insert: {
          arquivo_url: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          registro_id: string
        }
        Update: {
          arquivo_url?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          ordem?: number | null
          registro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_registros_fotos_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "obra_registros"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          atualizado_em: string | null
          atualizado_por: string | null
          cidade: string | null
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          created_by: string | null
          criado_em: string | null
          criado_por: string | null
          data_criacao: string | null
          data_inicio: string | null
          data_prevista_entrega: string | null
          data_termino_prevista: string | null
          data_termino_real: string | null
          descricao: string | null
          empresa_id: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          previsao_entrega: string | null
          responsavel_id: string | null
          status: string | null
          status_arquitetura: string | null
          status_engenharia: string | null
          status_marcenaria: string | null
          status_obra: string | null
          tipo: string | null
          updated_at: string | null
          user_id: string | null
          valor_contrato: number | null
          valor_executado: number | null
        }
        Insert: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cidade?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id?: string | null
          created_by?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_criacao?: string | null
          data_inicio?: string | null
          data_prevista_entrega?: string | null
          data_termino_prevista?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          empresa_id?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          previsao_entrega?: string | null
          responsavel_id?: string | null
          status?: string | null
          status_arquitetura?: string | null
          status_engenharia?: string | null
          status_marcenaria?: string | null
          status_obra?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_contrato?: number | null
          valor_executado?: number | null
        }
        Update: {
          atualizado_em?: string | null
          atualizado_por?: string | null
          cidade?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          contrato_id?: string | null
          created_by?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_criacao?: string | null
          data_inicio?: string | null
          data_prevista_entrega?: string | null
          data_termino_prevista?: string | null
          data_termino_real?: string | null
          descricao?: string | null
          empresa_id?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          previsao_entrega?: string | null
          responsavel_id?: string | null
          status?: string | null
          status_arquitetura?: string | null
          status_engenharia?: string | null
          status_marcenaria?: string | null
          status_obra?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_contrato?: number | null
          valor_executado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      obras_anexos: {
        Row: {
          categoria: string
          criado_em: string | null
          criado_por: string | null
          id: string
          mime_type: string | null
          nome_arquivo: string
          obra_id: string
          tamanho_bytes: number | null
          url_publica: string
        }
        Insert: {
          categoria: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          obra_id: string
          tamanho_bytes?: number | null
          url_publica: string
        }
        Update: {
          categoria?: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          obra_id?: string
          tamanho_bytes?: number | null
          url_publica?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_anexos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_anexos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      obras_etapas: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          data_conclusao: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          data_inicio_real: string | null
          etapa: string
          etapa_pai_id: string | null
          id: string
          obra_id: string
          observacoes: string | null
          percentual_concluido: number | null
          responsavel_id: string | null
          status: string
          tipo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          data_inicio_real?: string | null
          etapa: string
          etapa_pai_id?: string | null
          id?: string
          obra_id: string
          observacoes?: string | null
          percentual_concluido?: number | null
          responsavel_id?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          data_conclusao?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          data_inicio_real?: string | null
          etapa?: string
          etapa_pai_id?: string | null
          id?: string
          obra_id?: string
          observacoes?: string | null
          percentual_concluido?: number | null
          responsavel_id?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_etapa_pai"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_etapa_pai"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      obras_etapas_alertas: {
        Row: {
          created_at: string | null
          data_resolucao: string | null
          destinatarios: string[] | null
          etapa_id: string
          id: string
          lido: boolean | null
          mensagem: string | null
          obra_id: string
          resolvido: boolean | null
          resolvido_por_id: string | null
          severidade: string
          tipo_alerta: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          data_resolucao?: string | null
          destinatarios?: string[] | null
          etapa_id: string
          id?: string
          lido?: boolean | null
          mensagem?: string | null
          obra_id: string
          resolvido?: boolean | null
          resolvido_por_id?: string | null
          severidade: string
          tipo_alerta: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          data_resolucao?: string | null
          destinatarios?: string[] | null
          etapa_id?: string
          id?: string
          lido?: boolean | null
          mensagem?: string | null
          obra_id?: string
          resolvido?: boolean | null
          resolvido_por_id?: string | null
          severidade?: string
          tipo_alerta?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_etapas_alertas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_alertas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_alertas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_alertas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      obras_etapas_assinaturas: {
        Row: {
          assinatura_base64: string
          data_assinatura: string | null
          etapa_id: string
          id: string
          ip_address: string | null
          localizacao: Json | null
          observacoes: string | null
          responsavel_cargo: string | null
          responsavel_email: string | null
          responsavel_id: string | null
          responsavel_nome: string
          tipo_aprovacao: string
          user_agent: string | null
        }
        Insert: {
          assinatura_base64: string
          data_assinatura?: string | null
          etapa_id: string
          id?: string
          ip_address?: string | null
          localizacao?: Json | null
          observacoes?: string | null
          responsavel_cargo?: string | null
          responsavel_email?: string | null
          responsavel_id?: string | null
          responsavel_nome: string
          tipo_aprovacao: string
          user_agent?: string | null
        }
        Update: {
          assinatura_base64?: string
          data_assinatura?: string | null
          etapa_id?: string
          id?: string
          ip_address?: string | null
          localizacao?: Json | null
          observacoes?: string | null
          responsavel_cargo?: string | null
          responsavel_email?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string
          tipo_aprovacao?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_etapas_assinaturas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_assinaturas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      obras_etapas_checklist: {
        Row: {
          concluido: boolean | null
          etapa_id: string
          id: string
        }
        Insert: {
          concluido?: boolean | null
          etapa_id: string
          id?: string
        }
        Update: {
          concluido?: boolean | null
          etapa_id?: string
          id?: string
        }
        Relationships: []
      }
      obras_etapas_evidencias: {
        Row: {
          anexo_id: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          etapa_id: string
          id: string
          tipo: string
          titulo: string | null
        }
        Insert: {
          anexo_id: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          etapa_id: string
          id?: string
          tipo: string
          titulo?: string | null
        }
        Update: {
          anexo_id?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          etapa_id?: string
          id?: string
          tipo?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_etapas_evidencias_anexo_id_fkey"
            columns: ["anexo_id"]
            isOneToOne: false
            referencedRelation: "obras_anexos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_evidencias_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_evidencias_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      obras_etapas_historico: {
        Row: {
          alterado_por_id: string | null
          alterado_por_nome: string | null
          campo_alterado: string | null
          data_alteracao: string | null
          etapa_id: string
          id: string
          justificativa: string | null
          tipo_mudanca: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_por_id?: string | null
          alterado_por_nome?: string | null
          campo_alterado?: string | null
          data_alteracao?: string | null
          etapa_id: string
          id?: string
          justificativa?: string | null
          tipo_mudanca: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_por_id?: string | null
          alterado_por_nome?: string | null
          campo_alterado?: string | null
          data_alteracao?: string | null
          etapa_id?: string
          id?: string
          justificativa?: string | null
          tipo_mudanca?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_etapas_historico_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_historico_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidade_timeline: {
        Row: {
          arquivo_tipo: string | null
          arquivo_url: string | null
          contrato_id: string | null
          criado_em: string | null
          dados: Json | null
          descricao: string | null
          destaque: boolean | null
          id: string
          nucleo: string | null
          oportunidade_id: string | null
          origem: string
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string
          titulo: string
          usuario_id: string | null
          usuario_nome: string | null
          visivel_cliente: boolean | null
        }
        Insert: {
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          dados?: Json | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          nucleo?: string | null
          oportunidade_id?: string | null
          origem: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo: string
          titulo: string
          usuario_id?: string | null
          usuario_nome?: string | null
          visivel_cliente?: boolean | null
        }
        Update: {
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          dados?: Json | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          nucleo?: string | null
          oportunidade_id?: string | null
          origem?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
          visivel_cliente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_timeline_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          analise_projeto_id: string | null
          area_total: number | null
          atualizado_em: string | null
          atualizado_por: string | null
          avatar_url: string | null
          cliente_id: string
          condominio_contato: string | null
          condominio_nome: string | null
          contrato_id: string | null
          criado_em: string | null
          criado_por: string | null
          dados_imovel: Json | null
          dados_projeto: Json | null
          data_abertura: string | null
          data_fechamento_prevista: string | null
          data_fechamento_real: string | null
          descricao: string | null
          endereco_obra: string | null
          especificador_id: string | null
          estagio: string
          id: string
          indicado_por_id: string | null
          obra_regras_obs: string | null
          obra_sab_entrada: string | null
          obra_sab_saida: string | null
          obra_seg_sex_entrada: string | null
          obra_seg_sex_saida: string | null
          observacoes: string | null
          origem: string | null
          padrao_construtivo: string | null
          previsao_fechamento: string | null
          probabilidade: number | null
          progresso_arquitetura: number | null
          progresso_engenharia: number | null
          progresso_geral: number | null
          progresso_marcenaria: number | null
          proposta_id: string | null
          responsavel_funcao: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          tipo_imovel: string | null
          tipo_projeto: string | null
          titulo: string
          unidades_negocio: string[] | null
          updated_at: string | null
          valor: number | null
          valor_arquitetura: number | null
          valor_engenharia: number | null
          valor_estimado: number | null
          valor_marcenaria: number | null
          valor_total_executado: number | null
          vendedor_id: string | null
        }
        Insert: {
          analise_projeto_id?: string | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          avatar_url?: string | null
          cliente_id: string
          condominio_contato?: string | null
          condominio_nome?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          dados_imovel?: Json | null
          dados_projeto?: Json | null
          data_abertura?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          especificador_id?: string | null
          estagio: string
          id?: string
          indicado_por_id?: string | null
          obra_regras_obs?: string | null
          obra_sab_entrada?: string | null
          obra_sab_saida?: string | null
          obra_seg_sex_entrada?: string | null
          obra_seg_sex_saida?: string | null
          observacoes?: string | null
          origem?: string | null
          padrao_construtivo?: string | null
          previsao_fechamento?: string | null
          probabilidade?: number | null
          progresso_arquitetura?: number | null
          progresso_engenharia?: number | null
          progresso_geral?: number | null
          progresso_marcenaria?: number | null
          proposta_id?: string | null
          responsavel_funcao?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          tipo_imovel?: string | null
          tipo_projeto?: string | null
          titulo: string
          unidades_negocio?: string[] | null
          updated_at?: string | null
          valor?: number | null
          valor_arquitetura?: number | null
          valor_engenharia?: number | null
          valor_estimado?: number | null
          valor_marcenaria?: number | null
          valor_total_executado?: number | null
          vendedor_id?: string | null
        }
        Update: {
          analise_projeto_id?: string | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          avatar_url?: string | null
          cliente_id?: string
          condominio_contato?: string | null
          condominio_nome?: string | null
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          dados_imovel?: Json | null
          dados_projeto?: Json | null
          data_abertura?: string | null
          data_fechamento_prevista?: string | null
          data_fechamento_real?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          especificador_id?: string | null
          estagio?: string
          id?: string
          indicado_por_id?: string | null
          obra_regras_obs?: string | null
          obra_sab_entrada?: string | null
          obra_sab_saida?: string | null
          obra_seg_sex_entrada?: string | null
          obra_seg_sex_saida?: string | null
          observacoes?: string | null
          origem?: string | null
          padrao_construtivo?: string | null
          previsao_fechamento?: string | null
          probabilidade?: number | null
          progresso_arquitetura?: number | null
          progresso_engenharia?: number | null
          progresso_geral?: number | null
          progresso_marcenaria?: number | null
          proposta_id?: string | null
          responsavel_funcao?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          tipo_imovel?: string | null
          tipo_projeto?: string | null
          titulo?: string
          unidades_negocio?: string[] | null
          updated_at?: string | null
          valor?: number | null
          valor_arquitetura?: number | null
          valor_engenharia?: number | null
          valor_estimado?: number | null
          valor_marcenaria?: number | null
          valor_total_executado?: number | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_analise_projeto_id_fkey"
            columns: ["analise_projeto_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_analise_projeto_id_fkey"
            columns: ["analise_projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "oportunidades_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      oportunidades_arquivos: {
        Row: {
          criado_em: string | null
          file_name: string
          file_path: string
          id: string
          oportunidade_id: string
          uploaded_by: string | null
        }
        Insert: {
          criado_em?: string | null
          file_name: string
          file_path: string
          id?: string
          oportunidade_id: string
          uploaded_by?: string | null
        }
        Update: {
          criado_em?: string | null
          file_name?: string
          file_path?: string
          id?: string
          oportunidade_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_arquivos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_arquivos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_arquivos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades_auditoria: {
        Row: {
          campo_alterado: string | null
          criado_em: string | null
          id: string
          oportunidade_id: string
          usuario_id: string | null
          valor_antigo: string | null
          valor_novo: string | null
        }
        Insert: {
          campo_alterado?: string | null
          criado_em?: string | null
          id?: string
          oportunidade_id: string
          usuario_id?: string | null
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo_alterado?: string | null
          criado_em?: string | null
          id?: string
          oportunidade_id?: string
          usuario_id?: string | null
          valor_antigo?: string | null
          valor_novo?: string | null
        }
        Relationships: []
      }
      oportunidades_checklist: {
        Row: {
          concluido: boolean | null
          created_at: string | null
          id: string
          obrigatorio: boolean | null
          oportunidade_id: string | null
          titulo: string | null
        }
        Insert: {
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          obrigatorio?: boolean | null
          oportunidade_id?: string | null
          titulo?: string | null
        }
        Update: {
          concluido?: boolean | null
          created_at?: string | null
          id?: string
          obrigatorio?: boolean | null
          oportunidade_id?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_checklist_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_checklist_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "oportunidades_checklist_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades_historico: {
        Row: {
          criado_em: string | null
          estagio_anterior: string | null
          estagio_novo: string
          id: string
          observacao: string | null
          oportunidade_id: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          estagio_anterior?: string | null
          estagio_novo: string
          id?: string
          observacao?: string | null
          oportunidade_id: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          estagio_anterior?: string | null
          estagio_novo?: string
          id?: string
          observacao?: string | null
          oportunidade_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hist_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_hist_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_hist_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades_nucleos: {
        Row: {
          criado_em: string | null
          id: string
          nucleo: string
          oportunidade_id: string
          valor: number | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nucleo: string
          oportunidade_id: string
          valor?: number | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          nucleo?: string
          oportunidade_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_op_nucleos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_op_nucleos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_op_nucleos_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades_tarefas: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          data_limite: string | null
          descricao: string | null
          id: string
          oportunidade_id: string
          responsavel_id: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id: string
          responsavel_id?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id?: string
          responsavel_id?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tarefas_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefas_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "fk_tarefas_op"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          aprovado_cliente: boolean | null
          comprado: boolean | null
          comprado_em: string | null
          descricao: string
          grupo: string | null
          id: string
          orcamento_id: string | null
          pedido_compra_id: string | null
          quantidade: number
          subtotal: number | null
          valor_unitario: number
        }
        Insert: {
          aprovado_cliente?: boolean | null
          comprado?: boolean | null
          comprado_em?: string | null
          descricao: string
          grupo?: string | null
          id?: string
          orcamento_id?: string | null
          pedido_compra_id?: string | null
          quantidade?: number
          subtotal?: number | null
          valor_unitario?: number
        }
        Update: {
          aprovado_cliente?: boolean | null
          comprado?: boolean | null
          comprado_em?: string | null
          descricao?: string
          grupo?: string | null
          id?: string
          orcamento_id?: string | null
          pedido_compra_id?: string | null
          quantidade?: number
          subtotal?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "vw_orcamentos_pendentes_aprovacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_pedido_compra_id_fkey"
            columns: ["pedido_compra_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string | null
          cliente: string
          cliente_id: string | null
          criado_em: string | null
          criado_por: string | null
          data_validade: string | null
          descricao: string | null
          enviado_em: string | null
          id: string
          imposto: number | null
          link_aprovacao: string | null
          margem: number | null
          motivo_rejeicao: string | null
          nucleo_id: string | null
          numero: string | null
          obra_id: string | null
          observacoes: string | null
          observacoes_cliente: string | null
          rejeitado_em: string | null
          status: string | null
          titulo: string | null
          validade: string | null
          valor_total: number | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          cliente: string
          cliente_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_validade?: string | null
          descricao?: string | null
          enviado_em?: string | null
          id?: string
          imposto?: number | null
          link_aprovacao?: string | null
          margem?: number | null
          motivo_rejeicao?: string | null
          nucleo_id?: string | null
          numero?: string | null
          obra_id?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          rejeitado_em?: string | null
          status?: string | null
          titulo?: string | null
          validade?: string | null
          valor_total?: number | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          atualizado_em?: string | null
          cliente?: string
          cliente_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          data_validade?: string | null
          descricao?: string | null
          enviado_em?: string | null
          id?: string
          imposto?: number | null
          link_aprovacao?: string | null
          margem?: number | null
          motivo_rejeicao?: string | null
          nucleo_id?: string | null
          numero?: string | null
          obra_id?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          rejeitado_em?: string | null
          status?: string | null
          titulo?: string | null
          validade?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      orcamentos_historico: {
        Row: {
          cliente_aprovador: boolean | null
          created_at: string | null
          id: string
          ip_address: string | null
          observacao: string | null
          orcamento_id: string
          status_anterior: string | null
          status_novo: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          cliente_aprovador?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          observacao?: string | null
          orcamento_id: string
          status_anterior?: string | null
          status_novo: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          cliente_aprovador?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          observacao?: string | null
          orcamento_id?: string
          status_anterior?: string | null
          status_novo?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_historico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_historico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "vw_orcamentos_pendentes_aprovacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string
          contrato_id: string | null
          created_at: string
          created_by: string | null
          data_abertura: string
          data_conclusao: string | null
          data_previsao: string | null
          descricao: string
          endereco_atendimento: string | null
          id: string
          numero: string
          observacoes: string | null
          prioridade: string
          solucao: string | null
          status: string
          tecnico_responsavel_id: string | null
          tipo_atendimento: string
          titulo: string
          updated_at: string
          updated_by: string | null
          valor_aprovado_cliente: boolean
          valor_mao_obra: number
          valor_pecas: number
          valor_total: number
        }
        Insert: {
          cliente_id: string
          contrato_id?: string | null
          created_at?: string
          created_by?: string | null
          data_abertura?: string
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao: string
          endereco_atendimento?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          prioridade: string
          solucao?: string | null
          status?: string
          tecnico_responsavel_id?: string | null
          tipo_atendimento: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          valor_aprovado_cliente?: boolean
          valor_mao_obra?: number
          valor_pecas?: number
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          contrato_id?: string | null
          created_at?: string
          created_by?: string | null
          data_abertura?: string
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao?: string
          endereco_atendimento?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          prioridade?: string
          solucao?: string | null
          status?: string
          tecnico_responsavel_id?: string | null
          tipo_atendimento?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          valor_aprovado_cliente?: boolean
          valor_mao_obra?: number
          valor_pecas?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      os_historico: {
        Row: {
          created_at: string
          descricao: string
          id: string
          os_id: string
          status_anterior: string | null
          status_novo: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          os_id: string
          status_anterior?: string | null
          status_novo?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          os_id?: string
          status_anterior?: string | null
          status_novo?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_historico_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_ordens_servico_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          aplicado: boolean
          created_at: string
          descricao: string
          id: string
          observacoes: string | null
          os_id: string
          pricelist_item_id: string | null
          quantidade: number
          unidade: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          aplicado?: boolean
          created_at?: string
          descricao: string
          id?: string
          observacoes?: string | null
          os_id: string
          pricelist_item_id?: string | null
          quantidade: number
          unidade: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          aplicado?: boolean
          created_at?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          os_id?: string
          pricelist_item_id?: string | null
          quantidade?: number
          unidade?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_ordens_servico_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
        }
        Relationships: []
      }
      parcelas: {
        Row: {
          id: string
          id_financeiro: string
          numero: number
          pagamento: string | null
          status: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          id?: string
          id_financeiro: string
          numero: number
          pagamento?: string | null
          status?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          id?: string
          id_financeiro?: string
          numero?: number
          pagamento?: string | null
          status?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          criado_em: string | null
          fornecedor_id: string | null
          id: string
          obra_id: string | null
          observacoes: string | null
          solicitante_id: string | null
          status: string | null
        }
        Insert: {
          criado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          obra_id?: string | null
          observacoes?: string | null
          solicitante_id?: string | null
          status?: string | null
        }
        Update: {
          criado_em?: string | null
          fornecedor_id?: string | null
          id?: string
          obra_id?: string | null
          observacoes?: string | null
          solicitante_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          condicoes_pagamento: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          data_entrega_real: string | null
          data_pedido: string
          data_previsao_entrega: string | null
          fornecedor_id: string | null
          id: string
          numero: string
          observacoes: string | null
          projeto_id: string | null
          status: string | null
          unidade: string | null
          updated_at: string | null
          updated_by: string | null
          valor_total: number | null
        }
        Insert: {
          condicoes_pagamento?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_entrega_real?: string | null
          data_pedido?: string
          data_previsao_entrega?: string | null
          fornecedor_id?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          projeto_id?: string | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_total?: number | null
        }
        Update: {
          condicoes_pagamento?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_entrega_real?: string | null
          data_pedido?: string
          data_previsao_entrega?: string | null
          fornecedor_id?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          projeto_id?: string | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "pedidos_compra_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pedidos_compra_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "pedidos_compra_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra_itens: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          imagem_url: string | null
          observacoes: string | null
          origem: string | null
          pedido_id: string
          preco_total: number
          preco_unitario: number
          pricelist_item_id: string | null
          quantidade: number
          sku: string | null
          unidade: string | null
          url_origem: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          imagem_url?: string | null
          observacoes?: string | null
          origem?: string | null
          pedido_id: string
          preco_total?: number
          preco_unitario?: number
          pricelist_item_id?: string | null
          quantidade?: number
          sku?: string | null
          unidade?: string | null
          url_origem?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          imagem_url?: string | null
          observacoes?: string | null
          origem?: string | null
          pedido_id?: string
          preco_total?: number
          preco_unitario?: number
          pricelist_item_id?: string | null
          quantidade?: number
          sku?: string | null
          unidade?: string | null
          url_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_itens: {
        Row: {
          id: string
          item_id: string | null
          pedido_id: string | null
          quantidade: number | null
          total: number | null
          valor: number | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          pedido_id?: string | null
          quantidade?: number | null
          total?: number | null
          valor?: number | null
        }
        Update: {
          id?: string
          item_id?: string | null
          pedido_id?: string | null
          quantidade?: number | null
          total?: number | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "compras_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      percentuais_comissao: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria_id: string
          criado_em: string | null
          faixa_id: string
          id: string
          percentual: number
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria_id: string
          criado_em?: string | null
          faixa_id: string
          id?: string
          percentual: number
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria_id?: string
          criado_em?: string | null
          faixa_id?: string
          id?: string
          percentual?: number
        }
        Relationships: [
          {
            foreignKeyName: "percentuais_comissao_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_comissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "percentuais_comissao_faixa_id_fkey"
            columns: ["faixa_id"]
            isOneToOne: false
            referencedRelation: "faixas_vgv"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_tipo_usuario: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          modulo_id: string
          pode_criar: boolean | null
          pode_editar: boolean | null
          pode_excluir: boolean | null
          pode_exportar: boolean | null
          pode_importar: boolean | null
          pode_visualizar: boolean | null
          tipo_usuario: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          modulo_id: string
          pode_criar?: boolean | null
          pode_editar?: boolean | null
          pode_excluir?: boolean | null
          pode_exportar?: boolean | null
          pode_importar?: boolean | null
          pode_visualizar?: boolean | null
          tipo_usuario: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          modulo_id?: string
          pode_criar?: boolean | null
          pode_editar?: boolean | null
          pode_excluir?: boolean | null
          pode_exportar?: boolean | null
          pode_importar?: boolean | null
          pode_visualizar?: boolean | null
          tipo_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_tipo_usuario_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "sistema_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          atualizado_em: string | null
          avatar: string | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          cargo: string | null
          categoria_comissao_id: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          codigo_referencia: string | null
          colaborador_perfil_id: string | null
          complemento: string | null
          conta: string | null
          contato_responsavel: string | null
          cpf: string | null
          created_at: string | null
          criado_em: string | null
          custo_diaria: number | null
          custo_hora: number | null
          dados_bancarios: Json | null
          data_inicio_comissao: string | null
          drive_link: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          estado_civil: string | null
          foto_url: string | null
          genero: string | null
          id: string
          indicado_por_id: string | null
          is_master: boolean | null
          logradouro: string | null
          modelo_profissional: string | null
          nacionalidade: string | null
          nome: string
          numero: string | null
          obra_bairro: string | null
          obra_cep: string | null
          obra_cidade: string | null
          obra_complemento: string | null
          obra_endereco_diferente: boolean | null
          obra_estado: string | null
          obra_logradouro: string | null
          obra_numero: string | null
          observacoes: string | null
          pais: string | null
          pix: string | null
          profissao: string | null
          rg: string | null
          telefone: string | null
          tipo: string
          tipo_conta: string | null
          unidade: string | null
          updated_at: string | null
          vendedor_responsavel_id: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          categoria_comissao_id?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          codigo_referencia?: string | null
          colaborador_perfil_id?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          data_inicio_comissao?: string | null
          drive_link?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          indicado_por_id?: string | null
          is_master?: boolean | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome: string
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo: string
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
          vendedor_responsavel_id?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          categoria_comissao_id?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          codigo_referencia?: string | null
          colaborador_perfil_id?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          data_inicio_comissao?: string | null
          drive_link?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          indicado_por_id?: string | null
          is_master?: boolean | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome?: string
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo?: string
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
          vendedor_responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_categoria_comissao_id_fkey"
            columns: ["categoria_comissao_id"]
            isOneToOne: false
            referencedRelation: "categorias_comissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_colaborador_perfil_id_fkey"
            columns: ["colaborador_perfil_id"]
            isOneToOne: false
            referencedRelation: "colaborador_perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_indicado_por_id_fkey"
            columns: ["indicado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_vendedor_responsavel_id_fkey"
            columns: ["vendedor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      pipeline_wg_items: {
        Row: {
          cliente_nome: string
          created_at: string
          empresa_id: string | null
          id: string
          owner_id: string | null
          prazo: string | null
          prazo_label: string | null
          progresso: number | null
          status: Database["public"]["Enums"]["status_item_wg"]
          tipo: Database["public"]["Enums"]["tipo_item_wg"]
          titulo: string
          unidade: Database["public"]["Enums"]["unidade_wg"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_nome: string
          created_at?: string
          empresa_id?: string | null
          id?: string
          owner_id?: string | null
          prazo?: string | null
          prazo_label?: string | null
          progresso?: number | null
          status?: Database["public"]["Enums"]["status_item_wg"]
          tipo: Database["public"]["Enums"]["tipo_item_wg"]
          titulo: string
          unidade: Database["public"]["Enums"]["unidade_wg"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_nome?: string
          created_at?: string
          empresa_id?: string | null
          id?: string
          owner_id?: string | null
          prazo?: string | null
          prazo_label?: string | null
          progresso?: number | null
          status?: Database["public"]["Enums"]["status_item_wg"]
          tipo?: Database["public"]["Enums"]["tipo_item_wg"]
          titulo?: string
          unidade?: Database["public"]["Enums"]["unidade_wg"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      precificacao_empresas: {
        Row: {
          created_at: string | null
          custo_base: number | null
          dados: Json
          empresa_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_base?: number | null
          dados: Json
          empresa_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_base?: number | null
          dados?: Json
          empresa_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precificacao_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_compartilhamentos_completos"
            referencedColumns: ["empresa_id"]
          },
          {
            foreignKeyName: "precificacao_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      precificacao_nucleos: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          custo_hora_william_perc: number | null
          custo_mensal_william: number | null
          custo_operacional: number | null
          faturamento_meta: number | null
          fixos_perc: number | null
          fixos_valor: number | null
          id: string
          impostos_perc: number | null
          margem_lucro_perc: number | null
          nucleo_id: string | null
          nucleo_nome: string
          variaveis_perc: number | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          custo_hora_william_perc?: number | null
          custo_mensal_william?: number | null
          custo_operacional?: number | null
          faturamento_meta?: number | null
          fixos_perc?: number | null
          fixos_valor?: number | null
          id?: string
          impostos_perc?: number | null
          margem_lucro_perc?: number | null
          nucleo_id?: string | null
          nucleo_nome: string
          variaveis_perc?: number | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          custo_hora_william_perc?: number | null
          custo_mensal_william?: number | null
          custo_operacional?: number | null
          faturamento_meta?: number | null
          fixos_perc?: number | null
          fixos_valor?: number | null
          id?: string
          impostos_perc?: number | null
          margem_lucro_perc?: number | null
          nucleo_id?: string | null
          nucleo_nome?: string
          variaveis_perc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_nucleos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: true
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precificacao_nucleos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: true
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "precificacao_nucleos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: true
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
        ]
      }
      pricelist_aplicacoes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      pricelist_categorias: {
        Row: {
          ativo: boolean
          atualizado_em: string
          codigo: string | null
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
          parent_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
          parent_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          parent_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_categorias_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pricelist_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelist_fabricantes: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          nome: string
          site: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          site?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          site?: string | null
        }
        Relationships: []
      }
      pricelist_import_log: {
        Row: {
          arquivo_nome: string
          arquivo_tamanho_bytes: number | null
          arquivo_url: string | null
          categoria_padrao_id: string | null
          criado_em: string
          detalhes_erro: Json | null
          finalizado_em: string | null
          id: string
          mensagem_erro: string | null
          modo_importacao: string | null
          sobrescrever_precos: boolean | null
          status: string | null
          total_itens_atualizados: number | null
          total_itens_erro: number | null
          total_itens_importados: number | null
          total_linhas: number | null
          usuario_email: string | null
          usuario_id: string | null
        }
        Insert: {
          arquivo_nome: string
          arquivo_tamanho_bytes?: number | null
          arquivo_url?: string | null
          categoria_padrao_id?: string | null
          criado_em?: string
          detalhes_erro?: Json | null
          finalizado_em?: string | null
          id?: string
          mensagem_erro?: string | null
          modo_importacao?: string | null
          sobrescrever_precos?: boolean | null
          status?: string | null
          total_itens_atualizados?: number | null
          total_itens_erro?: number | null
          total_itens_importados?: number | null
          total_linhas?: number | null
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Update: {
          arquivo_nome?: string
          arquivo_tamanho_bytes?: number | null
          arquivo_url?: string | null
          categoria_padrao_id?: string | null
          criado_em?: string
          detalhes_erro?: Json | null
          finalizado_em?: string | null
          id?: string
          mensagem_erro?: string | null
          modo_importacao?: string | null
          sobrescrever_precos?: boolean | null
          status?: string | null
          total_itens_atualizados?: number | null
          total_itens_erro?: number | null
          total_itens_importados?: number | null
          total_linhas?: number | null
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_import_log_categoria_padrao_id_fkey"
            columns: ["categoria_padrao_id"]
            isOneToOne: false
            referencedRelation: "pricelist_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelist_import_temp: {
        Row: {
          categoria_nome: string | null
          codigo: string | null
          criado_em: string
          descricao: string | null
          especificacoes: string | null
          fornecedor_nome: string | null
          id: string
          import_log_id: string
          linha_excel: number | null
          marca: string | null
          mensagem_erro: string | null
          nome: string | null
          preco: string | null
          preco_custo: string | null
          status: string | null
          tipo: string | null
          unidade: string | null
        }
        Insert: {
          categoria_nome?: string | null
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          especificacoes?: string | null
          fornecedor_nome?: string | null
          id?: string
          import_log_id: string
          linha_excel?: number | null
          marca?: string | null
          mensagem_erro?: string | null
          nome?: string | null
          preco?: string | null
          preco_custo?: string | null
          status?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Update: {
          categoria_nome?: string | null
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          especificacoes?: string | null
          fornecedor_nome?: string | null
          id?: string
          import_log_id?: string
          linha_excel?: number | null
          marca?: string | null
          mensagem_erro?: string | null
          nome?: string | null
          preco?: string | null
          preco_custo?: string | null
          status?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_import_temp_import_log_id_fkey"
            columns: ["import_log_id"]
            isOneToOne: false
            referencedRelation: "pricelist_import_log"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelist_itens: {
        Row: {
          acabamento: string | null
          ambiente: string | null
          aplicacao: string | null
          ativo: boolean
          avaliacao: number | null
          borda: string | null
          categoria: string | null
          categoria_id: string | null
          codigo: string | null
          codigo_fabricante: string | null
          comprimento: number | null
          comprimento_cm: number | null
          controla_estoque: boolean | null
          cor: string | null
          created_at: string
          criado_em: string | null
          custo_aquisicao: number | null
          custo_operacional: number | null
          descricao: string | null
          destaque: boolean | null
          especificacoes: Json | null
          espessura: number | null
          espessura_cm: number | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fabricante: string | null
          ficha_tecnica_url: string | null
          formato: string | null
          fornecedor_id: string | null
          id: string
          imagem_url: string | null
          largura: number | null
          largura_cm: number | null
          linha: string | null
          link_produto: string | null
          lucro_estimado: number | null
          m2_caixa: number | null
          m2_peca: number | null
          marca: string | null
          margem_lucro: number | null
          margem_percentual: number | null
          markup: number | null
          modelo: string | null
          multiplo_venda: number | null
          nome: string
          nucleo: string | null
          nucleo_id: string | null
          peso: number | null
          preco: number | null
          preco_caixa: number | null
          preco_com_desconto: number | null
          preco_custo: number | null
          preco_final: number | null
          preco_m2: number | null
          preco_minimo: number | null
          preco_venda: number | null
          producao_diaria: number | null
          rendimento: number | null
          resistencia: string | null
          subcategoria_id: string | null
          tipo: string | null
          total_avaliacoes: number | null
          ultima_atualizacao_preco: string | null
          unidade: string | null
          unidade_estoque: string | null
          unidade_venda: string | null
          unidades_caixa: number | null
          updated_at: string
          url_referencia: string | null
        }
        Insert: {
          acabamento?: string | null
          ambiente?: string | null
          aplicacao?: string | null
          ativo?: boolean
          avaliacao?: number | null
          borda?: string | null
          categoria?: string | null
          categoria_id?: string | null
          codigo?: string | null
          codigo_fabricante?: string | null
          comprimento?: number | null
          comprimento_cm?: number | null
          controla_estoque?: boolean | null
          cor?: string | null
          created_at?: string
          criado_em?: string | null
          custo_aquisicao?: number | null
          custo_operacional?: number | null
          descricao?: string | null
          destaque?: boolean | null
          especificacoes?: Json | null
          espessura?: number | null
          espessura_cm?: number | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fabricante?: string | null
          ficha_tecnica_url?: string | null
          formato?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          largura?: number | null
          largura_cm?: number | null
          linha?: string | null
          link_produto?: string | null
          lucro_estimado?: number | null
          m2_caixa?: number | null
          m2_peca?: number | null
          marca?: string | null
          margem_lucro?: number | null
          margem_percentual?: number | null
          markup?: number | null
          modelo?: string | null
          multiplo_venda?: number | null
          nome: string
          nucleo?: string | null
          nucleo_id?: string | null
          peso?: number | null
          preco?: number | null
          preco_caixa?: number | null
          preco_com_desconto?: number | null
          preco_custo?: number | null
          preco_final?: number | null
          preco_m2?: number | null
          preco_minimo?: number | null
          preco_venda?: number | null
          producao_diaria?: number | null
          rendimento?: number | null
          resistencia?: string | null
          subcategoria_id?: string | null
          tipo?: string | null
          total_avaliacoes?: number | null
          ultima_atualizacao_preco?: string | null
          unidade?: string | null
          unidade_estoque?: string | null
          unidade_venda?: string | null
          unidades_caixa?: number | null
          updated_at?: string
          url_referencia?: string | null
        }
        Update: {
          acabamento?: string | null
          ambiente?: string | null
          aplicacao?: string | null
          ativo?: boolean
          avaliacao?: number | null
          borda?: string | null
          categoria?: string | null
          categoria_id?: string | null
          codigo?: string | null
          codigo_fabricante?: string | null
          comprimento?: number | null
          comprimento_cm?: number | null
          controla_estoque?: boolean | null
          cor?: string | null
          created_at?: string
          criado_em?: string | null
          custo_aquisicao?: number | null
          custo_operacional?: number | null
          descricao?: string | null
          destaque?: boolean | null
          especificacoes?: Json | null
          espessura?: number | null
          espessura_cm?: number | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fabricante?: string | null
          ficha_tecnica_url?: string | null
          formato?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          largura?: number | null
          largura_cm?: number | null
          linha?: string | null
          link_produto?: string | null
          lucro_estimado?: number | null
          m2_caixa?: number | null
          m2_peca?: number | null
          marca?: string | null
          margem_lucro?: number | null
          margem_percentual?: number | null
          markup?: number | null
          modelo?: string | null
          multiplo_venda?: number | null
          nome?: string
          nucleo?: string | null
          nucleo_id?: string | null
          peso?: number | null
          preco?: number | null
          preco_caixa?: number | null
          preco_com_desconto?: number | null
          preco_custo?: number | null
          preco_final?: number | null
          preco_m2?: number | null
          preco_minimo?: number | null
          preco_venda?: number | null
          producao_diaria?: number | null
          rendimento?: number | null
          resistencia?: string | null
          subcategoria_id?: string | null
          tipo?: string | null
          total_avaliacoes?: number | null
          ultima_atualizacao_preco?: string | null
          unidade?: string | null
          unidade_estoque?: string | null
          unidade_venda?: string | null
          unidades_caixa?: number | null
          updated_at?: string
          url_referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "pricelist_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "pricelist_itens_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "pricelist_subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelist_subcategorias: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          categoria_id: string
          criado_em: string | null
          id: string
          nome: string
          ordem: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria_id: string
          criado_em?: string | null
          id?: string
          nome: string
          ordem?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          categoria_id?: string
          criado_em?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "pricelist_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_complementares: {
        Row: {
          ativo: boolean | null
          categoria_base: string | null
          categoria_complemento: string | null
          codigo: string
          complemento: string
          created_at: string | null
          id: string
          preco_referencia: number | null
          produto_base: string
          quantidade_por_unidade: number | null
          tipo: string | null
          unidade_calculo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_base?: string | null
          categoria_complemento?: string | null
          codigo: string
          complemento: string
          created_at?: string | null
          id?: string
          preco_referencia?: number | null
          produto_base: string
          quantidade_por_unidade?: number | null
          tipo?: string | null
          unidade_calculo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_base?: string | null
          categoria_complemento?: string | null
          codigo?: string
          complemento?: string
          created_at?: string | null
          id?: string
          preco_referencia?: number | null
          produto_base?: string
          quantidade_por_unidade?: number | null
          tipo?: string | null
          unidade_calculo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      project_items: {
        Row: {
          catalog_item_id: string
          created_at: string | null
          id: string
          project_id: string
          quantity: number
        }
        Insert: {
          catalog_item_id: string
          created_at?: string | null
          id?: string
          project_id: string
          quantity: number
        }
        Update: {
          catalog_item_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_task_dependencies: {
        Row: {
          depende_de: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          depende_de?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          depende_de?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_task_dependencies_depende_de_fkey"
            columns: ["depende_de"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          descricao: string | null
          fim: string | null
          id: string
          inicio: string | null
          progresso: number | null
          project_id: string | null
          responsavel: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          progresso?: number | null
          project_id?: string | null
          responsavel?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          progresso?: number | null
          project_id?: string | null
          responsavel?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks_comentarios: {
        Row: {
          comentario: string
          created_at: string | null
          editado: boolean | null
          id: string
          mencoes: string[] | null
          task_id: string
          updated_at: string | null
          usuario_avatar: string | null
          usuario_id: string
          usuario_nome: string
        }
        Insert: {
          comentario: string
          created_at?: string | null
          editado?: boolean | null
          id?: string
          mencoes?: string[] | null
          task_id: string
          updated_at?: string | null
          usuario_avatar?: string | null
          usuario_id: string
          usuario_nome: string
        }
        Update: {
          comentario?: string
          created_at?: string | null
          editado?: boolean | null
          id?: string
          mencoes?: string[] | null
          task_id?: string
          updated_at?: string | null
          usuario_avatar?: string | null
          usuario_id?: string
          usuario_nome?: string
        }
        Relationships: []
      }
      project_team: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          approval_status: string | null
          client_id: string | null
          created_at: string | null
          criado_em: string | null
          descricao: string | null
          fim: string
          id: string
          inicio: string
          name: string | null
          nome: string
          obra_id: string | null
          progresso: number | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          client_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          fim: string
          id?: string
          inicio: string
          name?: string | null
          nome: string
          obra_id?: string | null
          progresso?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          client_id?: string | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          fim?: string
          id?: string
          inicio?: string
          name?: string | null
          nome?: string
          obra_id?: string | null
          progresso?: number | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      projeto_equipe: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_entrada: string | null
          data_saida: string | null
          funcao_no_projeto: string | null
          id: string
          observacoes: string | null
          pessoa_id: string
          projeto_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          funcao_no_projeto?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          projeto_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          funcao_no_projeto?: string | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          projeto_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipe_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipe_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_equipe_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_equipes: {
        Row: {
          created_at: string | null
          custo_hora: number | null
          data_atribuicao: string | null
          data_fim_alocacao: string | null
          data_inicio_alocacao: string | null
          funcao: string | null
          horas_alocadas: number | null
          id: string
          is_responsavel: boolean | null
          pessoa_id: string
          projeto_id: string
          tarefa_id: string | null
          tipo_pessoa: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_hora?: number | null
          data_atribuicao?: string | null
          data_fim_alocacao?: string | null
          data_inicio_alocacao?: string | null
          funcao?: string | null
          horas_alocadas?: number | null
          id?: string
          is_responsavel?: boolean | null
          pessoa_id: string
          projeto_id: string
          tarefa_id?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_hora?: number | null
          data_atribuicao?: string | null
          data_fim_alocacao?: string | null
          data_inicio_alocacao?: string | null
          funcao?: string | null
          horas_alocadas?: number | null
          id?: string
          is_responsavel?: boolean | null
          pessoa_id?: string
          projeto_id?: string
          tarefa_id?: string | null
          tipo_pessoa?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "cronograma_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_lista_compras: {
        Row: {
          ambiente: string | null
          categoria_id: string | null
          codigo: string
          created_at: string | null
          data_aprovacao: string | null
          data_compra: string | null
          data_entrega: string | null
          descricao: string
          especificacao: string | null
          fornecedor: string | null
          id: string
          link_produto: string | null
          preco_unitario: number | null
          pricelist_id: string | null
          projeto_id: string | null
          quantidade_compra: number | null
          quantidade_projeto: number | null
          quantitativo_id: string | null
          status: string | null
          taxa_fee_percent: number | null
          tipo_compra: string
          tipo_conta: string
          unidade: string | null
          updated_at: string | null
          valor_fee: number | null
          valor_total: number | null
        }
        Insert: {
          ambiente?: string | null
          categoria_id?: string | null
          codigo: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_compra?: string | null
          data_entrega?: string | null
          descricao: string
          especificacao?: string | null
          fornecedor?: string | null
          id?: string
          link_produto?: string | null
          preco_unitario?: number | null
          pricelist_id?: string | null
          projeto_id?: string | null
          quantidade_compra?: number | null
          quantidade_projeto?: number | null
          quantitativo_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          unidade?: string | null
          updated_at?: string | null
          valor_fee?: number | null
          valor_total?: number | null
        }
        Update: {
          ambiente?: string | null
          categoria_id?: string | null
          codigo?: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_compra?: string | null
          data_entrega?: string | null
          descricao?: string
          especificacao?: string | null
          fornecedor?: string | null
          id?: string
          link_produto?: string | null
          preco_unitario?: number | null
          pricelist_id?: string | null
          projeto_id?: string | null
          quantidade_compra?: number | null
          quantidade_projeto?: number | null
          quantitativo_id?: string | null
          status?: string | null
          taxa_fee_percent?: number | null
          tipo_compra?: string
          tipo_conta?: string
          unidade?: string | null
          updated_at?: string | null
          valor_fee?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_lista_compras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_lista_compras_quantitativo_id_fkey"
            columns: ["quantitativo_id"]
            isOneToOne: false
            referencedRelation: "projeto_quantitativo"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_quantitativo: {
        Row: {
          ambiente: string
          aplicacao: string | null
          assunto: string | null
          codigo: string
          codigo_produto: string | null
          created_at: string | null
          descricao_projeto: string
          fabricante: string | null
          fornecedor: string | null
          id: string
          modelo: string | null
          observacoes: string | null
          pricelist_id: string | null
          projeto_id: string | null
          quantidade_compra: number | null
          quantidade_projeto: number | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ambiente: string
          aplicacao?: string | null
          assunto?: string | null
          codigo: string
          codigo_produto?: string | null
          created_at?: string | null
          descricao_projeto: string
          fabricante?: string | null
          fornecedor?: string | null
          id?: string
          modelo?: string | null
          observacoes?: string | null
          pricelist_id?: string | null
          projeto_id?: string | null
          quantidade_compra?: number | null
          quantidade_projeto?: number | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ambiente?: string
          aplicacao?: string | null
          assunto?: string | null
          codigo?: string
          codigo_produto?: string | null
          created_at?: string | null
          descricao_projeto?: string
          fabricante?: string | null
          fornecedor?: string | null
          id?: string
          modelo?: string | null
          observacoes?: string | null
          pricelist_id?: string | null
          projeto_id?: string | null
          quantidade_compra?: number | null
          quantidade_projeto?: number | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_quantitativo_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_quantitativo_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_quantitativo_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_quantitativo_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_quantitativo_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_quantitativo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_compras"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          cliente_id: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          data_inicio: string | null
          data_termino: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          nome: string
          nucleo: string | null
          numero: string | null
          progresso: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          nucleo?: string | null
          numero?: string | null
          progresso?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          nucleo?: string | null
          numero?: string | null
          progresso?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      projetos_compras: {
        Row: {
          area_total: number | null
          cliente_id: string | null
          cliente_nome: string | null
          codigo: string
          contrato_id: string | null
          created_at: string | null
          data_inicio: string | null
          data_previsao: string | null
          endereco: string | null
          id: string
          nome: string
          status: string | null
          tipo_projeto: string | null
          updated_at: string | null
        }
        Insert: {
          area_total?: number | null
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo: string
          contrato_id?: string | null
          created_at?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          id?: string
          nome: string
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string | null
        }
        Update: {
          area_total?: number | null
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo?: string
          contrato_id?: string | null
          created_at?: string | null
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          status?: string | null
          tipo_projeto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_compras_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_compras_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "projetos_compras_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      proposta_contratos_selecao: {
        Row: {
          criado_em: string | null
          criar_conta_virtual: boolean | null
          id: string
          nucleo_id: string
          observacoes: string | null
          proposta_id: string
          tipo_financeiro: string
        }
        Insert: {
          criado_em?: string | null
          criar_conta_virtual?: boolean | null
          id?: string
          nucleo_id: string
          observacoes?: string | null
          proposta_id: string
          tipo_financeiro?: string
        }
        Update: {
          criado_em?: string | null
          criar_conta_virtual?: boolean | null
          id?: string
          nucleo_id?: string
          observacoes?: string | null
          proposta_id?: string
          tipo_financeiro?: string
        }
        Relationships: []
      }
      proposta_itens: {
        Row: {
          desconto: number | null
          id: string
          product_id: string | null
          proposta_id: string | null
          quantidade: number | null
        }
        Insert: {
          desconto?: number | null
          id?: string
          product_id?: string | null
          proposta_id?: string | null
          quantidade?: number | null
        }
        Update: {
          desconto?: number | null
          id?: string
          product_id?: string | null
          proposta_id?: string | null
          quantidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      propostas: {
        Row: {
          analise_projeto_id: string | null
          cliente_id: string | null
          created_by: string | null
          criado_em: string | null
          data_criacao: string | null
          descricao: string | null
          empresa_id: string | null
          exibir_valores: boolean
          forma_pagamento: string | null
          id: string
          nucleo: string | null
          nucleo_id: string | null
          numero: string | null
          numero_parcelas: number | null
          obra_id: string | null
          oportunidade_id: string | null
          pagamento_cartao: boolean | null
          percentual_entrada: number | null
          prazo_execucao_dias: number | null
          status: string | null
          titulo: string | null
          updated_at: string | null
          validade_dias: number | null
          valor_mao_obra: number | null
          valor_materiais: number | null
          valor_raw: string | null
          valor_total: number | null
        }
        Insert: {
          analise_projeto_id?: string | null
          cliente_id?: string | null
          created_by?: string | null
          criado_em?: string | null
          data_criacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          exibir_valores?: boolean
          forma_pagamento?: string | null
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          numero?: string | null
          numero_parcelas?: number | null
          obra_id?: string | null
          oportunidade_id?: string | null
          pagamento_cartao?: boolean | null
          percentual_entrada?: number | null
          prazo_execucao_dias?: number | null
          status?: string | null
          titulo?: string | null
          updated_at?: string | null
          validade_dias?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_raw?: string | null
          valor_total?: number | null
        }
        Update: {
          analise_projeto_id?: string | null
          cliente_id?: string | null
          created_by?: string | null
          criado_em?: string | null
          data_criacao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          exibir_valores?: boolean
          forma_pagamento?: string | null
          id?: string
          nucleo?: string | null
          nucleo_id?: string | null
          numero?: string | null
          numero_parcelas?: number | null
          obra_id?: string | null
          oportunidade_id?: string | null
          pagamento_cartao?: boolean | null
          percentual_entrada?: number | null
          prazo_execucao_dias?: number | null
          status?: string | null
          titulo?: string | null
          updated_at?: string | null
          validade_dias?: number | null
          valor_mao_obra?: number | null
          valor_materiais?: number | null
          valor_raw?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_analise_projeto_id_fkey"
            columns: ["analise_projeto_id"]
            isOneToOne: false
            referencedRelation: "analises_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_analise_projeto_id_fkey"
            columns: ["analise_projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_analises_projeto_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey_pessoas"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "propostas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_ambientes: {
        Row: {
          area_parede: number
          area_piso: number
          area_teto: number
          atualizado_em: string | null
          comprimento: number
          criado_em: string | null
          criado_por: string | null
          id: string
          largura: number
          nome: string
          nucleo_id: string | null
          observacoes: string | null
          ordem: number | null
          pe_direito: number | null
          perimetro: number
          proposta_id: string
        }
        Insert: {
          area_parede: number
          area_piso: number
          area_teto: number
          atualizado_em?: string | null
          comprimento: number
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          largura: number
          nome: string
          nucleo_id?: string | null
          observacoes?: string | null
          ordem?: number | null
          pe_direito?: number | null
          perimetro: number
          proposta_id: string
        }
        Update: {
          area_parede?: number
          area_piso?: number
          area_teto?: number
          atualizado_em?: string | null
          comprimento?: number
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          largura?: number
          nome?: string
          nucleo_id?: string | null
          observacoes?: string | null
          ordem?: number | null
          pe_direito?: number | null
          perimetro?: number
          proposta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      propostas_condicoes_pagamento: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          descricao: string | null
          forma_pagamento: string | null
          id: string
          nucleo_id: string | null
          proposta_id: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          nucleo_id?: string | null
          proposta_id: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          nucleo_id?: string | null
          proposta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "propostas_condicoes_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_condicoes_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_condicoes_pagamento_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_condicoes_pagamento_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_condicoes_pagamento_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      propostas_itens: {
        Row: {
          ambiente_id: string | null
          categoria: string | null
          categoria_id: string | null
          codigo: string | null
          criado_em: string
          descricao: string | null
          descricao_customizada: string | null
          id: string
          nome: string
          nucleo: string | null
          nucleo_id: string | null
          ordem: number | null
          pricelist_item_id: string | null
          proposta_id: string
          quantidade: number
          subtotal: number | null
          tipo: string | null
          unidade: string | null
          updated_at: string | null
          valor_subtotal: number | null
          valor_unitario: number
        }
        Insert: {
          ambiente_id?: string | null
          categoria?: string | null
          categoria_id?: string | null
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          descricao_customizada?: string | null
          id?: string
          nome: string
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          pricelist_item_id?: string | null
          proposta_id: string
          quantidade?: number
          subtotal?: number | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_subtotal?: number | null
          valor_unitario: number
        }
        Update: {
          ambiente_id?: string | null
          categoria?: string | null
          categoria_id?: string | null
          codigo?: string | null
          criado_em?: string
          descricao?: string | null
          descricao_customizada?: string | null
          id?: string
          nome?: string
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          pricelist_item_id?: string | null
          proposta_id?: string
          quantidade?: number
          subtotal?: number | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_subtotal?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_itens_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "propostas_ambientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "vw_propostas_ambientes_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      propostas_itens_backup: {
        Row: {
          ambiente_id: string | null
          categoria: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string | null
          descricao_customizada: string | null
          id: string | null
          nome: string | null
          nucleo: string | null
          nucleo_id: string | null
          ordem: number | null
          pricelist_item_id: string | null
          proposta_id: string | null
          quantidade: number | null
          subtotal: number | null
          tipo: string | null
          unidade: string | null
          updated_at: string | null
          valor_subtotal: number | null
          valor_unitario: number | null
        }
        Insert: {
          ambiente_id?: string | null
          categoria?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_customizada?: string | null
          id?: string | null
          nome?: string | null
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          pricelist_item_id?: string | null
          proposta_id?: string | null
          quantidade?: number | null
          subtotal?: number | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_subtotal?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ambiente_id?: string | null
          categoria?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          descricao_customizada?: string | null
          id?: string | null
          nome?: string | null
          nucleo?: string | null
          nucleo_id?: string | null
          ordem?: number | null
          pricelist_item_id?: string | null
          proposta_id?: string | null
          quantidade?: number | null
          subtotal?: number | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_subtotal?: number | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      propostas_marcenaria: {
        Row: {
          ambiente_id: string | null
          articulador_marca: string | null
          articulador_modelo: string | null
          atualizado_em: string | null
          caixa_acabamento: string | null
          caixa_especificacao: string | null
          corredica_marca: string | null
          corredica_modelo: string | null
          criado_em: string | null
          dobradica_marca: string | null
          dobradica_modelo: string | null
          frente_acabamento: string | null
          frente_especificacao: string | null
          id: string
          ordem: number | null
          proposta_id: string
          subtotal: number | null
          tipo_secao: string | null
        }
        Insert: {
          ambiente_id?: string | null
          articulador_marca?: string | null
          articulador_modelo?: string | null
          atualizado_em?: string | null
          caixa_acabamento?: string | null
          caixa_especificacao?: string | null
          corredica_marca?: string | null
          corredica_modelo?: string | null
          criado_em?: string | null
          dobradica_marca?: string | null
          dobradica_modelo?: string | null
          frente_acabamento?: string | null
          frente_especificacao?: string | null
          id?: string
          ordem?: number | null
          proposta_id: string
          subtotal?: number | null
          tipo_secao?: string | null
        }
        Update: {
          ambiente_id?: string | null
          articulador_marca?: string | null
          articulador_modelo?: string | null
          atualizado_em?: string | null
          caixa_acabamento?: string | null
          caixa_especificacao?: string | null
          corredica_marca?: string | null
          corredica_modelo?: string | null
          criado_em?: string | null
          dobradica_marca?: string | null
          dobradica_modelo?: string | null
          frente_acabamento?: string | null
          frente_especificacao?: string | null
          id?: string
          ordem?: number | null
          proposta_id?: string
          subtotal?: number | null
          tipo_secao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_marcenaria_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "propostas_ambientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_marcenaria_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "vw_propostas_ambientes_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_marcenaria_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_marcenaria_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      propostas_parcelas: {
        Row: {
          condicao_pagamento_id: string
          criado_em: string | null
          data_vencimento: string | null
          descricao: string | null
          id: string
          numero_parcela: number
          observacao: string | null
          ordem: number | null
          percentual: number | null
          valor: number
        }
        Insert: {
          condicao_pagamento_id: string
          criado_em?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          numero_parcela: number
          observacao?: string | null
          ordem?: number | null
          percentual?: number | null
          valor: number
        }
        Update: {
          condicao_pagamento_id?: string
          criado_em?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          id?: string
          numero_parcela?: number
          observacao?: string | null
          ordem?: number | null
          percentual?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_parcelas_condicao_pagamento_id_fkey"
            columns: ["condicao_pagamento_id"]
            isOneToOne: false
            referencedRelation: "propostas_condicoes_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_textos_padrao: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          chave: string
          conteudo: string
          criado_em: string | null
          id: string
          titulo: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          chave: string
          conteudo: string
          criado_em?: string | null
          id?: string
          titulo?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          chave?: string
          conteudo?: string
          criado_em?: string | null
          id?: string
          titulo?: string | null
        }
        Relationships: []
      }
      quantitativos_acabamentos: {
        Row: {
          ambiente: string | null
          area_m2: number | null
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          especificacao: Json | null
          id: string
          material: string | null
          metragem_linear: number | null
          nucleo_id: string | null
          projeto_id: string | null
          quantidade: number | null
          tipo_acabamento: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          ambiente?: string | null
          area_m2?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          especificacao?: Json | null
          id?: string
          material?: string | null
          metragem_linear?: number | null
          nucleo_id?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          tipo_acabamento: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ambiente?: string | null
          area_m2?: number | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          especificacao?: Json | null
          id?: string
          material?: string | null
          metragem_linear?: number | null
          nucleo_id?: string | null
          projeto_id?: string | null
          quantidade?: number | null
          tipo_acabamento?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_acabamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_acabamentos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_elementos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_quantitativos_projetos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_ambientes: {
        Row: {
          area: number | null
          atualizado_em: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          pe_direito: number | null
          perimetro: number | null
          projeto_id: string
          tipo_ambiente: string | null
        }
        Insert: {
          area?: number | null
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          pe_direito?: number | null
          perimetro?: number | null
          projeto_id: string
          tipo_ambiente?: string | null
        }
        Update: {
          area?: number | null
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          pe_direito?: number | null
          perimetro?: number | null
          projeto_id?: string
          tipo_ambiente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_ambientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_ambientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_acabamentos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_ambientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_elementos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_ambientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_quantitativos_projetos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_analises_ia: {
        Row: {
          acabamentos_detectados: number | null
          ambientes_detectados: number | null
          arquivo_nome: string | null
          arquivo_tipo: string | null
          arquivo_url: string | null
          criado_em: string | null
          criado_por: string | null
          elementos_detectados: number | null
          erro_mensagem: string | null
          id: string
          metadados: Json | null
          modelo_ia: string | null
          nucleo_id: string | null
          observacoes: string[] | null
          projeto_id: string | null
          provedor_ia: string | null
          resultado_json: Json | null
          status: string | null
          tempo_processamento_ms: number | null
          tipo_analise: string | null
        }
        Insert: {
          acabamentos_detectados?: number | null
          ambientes_detectados?: number | null
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          criado_em?: string | null
          criado_por?: string | null
          elementos_detectados?: number | null
          erro_mensagem?: string | null
          id?: string
          metadados?: Json | null
          modelo_ia?: string | null
          nucleo_id?: string | null
          observacoes?: string[] | null
          projeto_id?: string | null
          provedor_ia?: string | null
          resultado_json?: Json | null
          status?: string | null
          tempo_processamento_ms?: number | null
          tipo_analise?: string | null
        }
        Update: {
          acabamentos_detectados?: number | null
          ambientes_detectados?: number | null
          arquivo_nome?: string | null
          arquivo_tipo?: string | null
          arquivo_url?: string | null
          criado_em?: string | null
          criado_por?: string | null
          elementos_detectados?: number | null
          erro_mensagem?: string | null
          id?: string
          metadados?: Json | null
          modelo_ia?: string | null
          nucleo_id?: string | null
          observacoes?: string[] | null
          projeto_id?: string | null
          provedor_ia?: string | null
          resultado_json?: Json | null
          status?: string | null
          tempo_processamento_ms?: number | null
          tipo_analise?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_analises_ia_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_acabamentos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_elementos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_quantitativos_projetos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_categorias: {
        Row: {
          ambiente_id: string
          atualizado_em: string | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ambiente_id: string
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ambiente_id?: string
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_categorias_ambiente_id_fkey"
            columns: ["ambiente_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_ambientes"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_elementos: {
        Row: {
          altura: number | null
          ambiente: string | null
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          especificacao: Json | null
          id: string
          largura: number | null
          nucleo_id: string | null
          profundidade: number | null
          projeto_id: string | null
          quantidade: number | null
          tipo_elemento: string
        }
        Insert: {
          altura?: number | null
          ambiente?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          especificacao?: Json | null
          id?: string
          largura?: number | null
          nucleo_id?: string | null
          profundidade?: number | null
          projeto_id?: string | null
          quantidade?: number | null
          tipo_elemento: string
        }
        Update: {
          altura?: number | null
          ambiente?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          especificacao?: Json | null
          id?: string
          largura?: number | null
          nucleo_id?: string | null
          profundidade?: number | null
          projeto_id?: string | null
          quantidade?: number | null
          tipo_elemento?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_elementos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_acabamentos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_elementos_por_projeto"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "quantitativos_elementos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_quantitativos_projetos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_itens: {
        Row: {
          atualizado_em: string | null
          categoria_id: string
          codigo: string | null
          criado_em: string | null
          descricao: string | null
          especificacao: string | null
          id: string
          nome: string
          observacoes: string | null
          ordem: number | null
          preco_total: number | null
          preco_unitario: number | null
          pricelist_item_id: string | null
          quantidade: number
          sincronizar_preco: boolean | null
          unidade: string
        }
        Insert: {
          atualizado_em?: string | null
          categoria_id: string
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          especificacao?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          ordem?: number | null
          preco_total?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          quantidade?: number
          sincronizar_preco?: boolean | null
          unidade: string
        }
        Update: {
          atualizado_em?: string | null
          categoria_id?: string
          codigo?: string | null
          criado_em?: string | null
          descricao?: string | null
          especificacao?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          ordem?: number | null
          preco_total?: number | null
          preco_unitario?: number | null
          pricelist_item_id?: string | null
          quantidade?: number
          sincronizar_preco?: boolean | null
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      quantitativos_projetos: {
        Row: {
          area_construida: number | null
          area_total: number | null
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_id: string
          contrato_id: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          endereco_obra: string | null
          id: string
          nome: string
          nucleo: string
          nucleo_id: string | null
          numero: string
          observacoes: string | null
          proposta_id: string | null
          status: string | null
          versao: number | null
        }
        Insert: {
          area_construida?: number | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_id: string
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          id?: string
          nome: string
          nucleo?: string
          nucleo_id?: string | null
          numero: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string | null
          versao?: number | null
        }
        Update: {
          area_construida?: number | null
          area_total?: number | null
          atualizado_em?: string | null
          atualizado_por?: string | null
          cliente_id?: string
          contrato_id?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          endereco_obra?: string | null
          id?: string
          nome?: string
          nucleo?: string
          nucleo_id?: string | null
          numero?: string
          observacoes?: string | null
          proposta_id?: string | null
          status?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_projetos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      quantitativos_templates: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          estrutura: Json
          id: string
          nome: string
          nucleo: string | null
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          estrutura: Json
          id?: string
          nome: string
          nucleo?: string | null
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string | null
          descricao?: string | null
          estrutura?: Json
          id?: string
          nome?: string
          nucleo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_presence: {
        Row: {
          criado_em: string | null
          dados: Json | null
          id: string
          pagina_atual: string | null
          status: string | null
          ultimo_heartbeat: string | null
          user_id: string
        }
        Insert: {
          criado_em?: string | null
          dados?: Json | null
          id?: string
          pagina_atual?: string | null
          status?: string | null
          ultimo_heartbeat?: string | null
          user_id: string
        }
        Update: {
          criado_em?: string | null
          dados?: Json | null
          id?: string
          pagina_atual?: string | null
          status?: string | null
          ultimo_heartbeat?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "realtime_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_typing: {
        Row: {
          canal: string
          id: string
          iniciado_em: string | null
          user_id: string
        }
        Insert: {
          canal: string
          id?: string
          iniciado_em?: string | null
          user_id: string
        }
        Update: {
          canal?: string
          id?: string
          iniciado_em?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtime_typing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "realtime_typing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_points: {
        Row: {
          ambiente: string | null
          criado_por: string | null
          dados_contexto: Json | null
          descricao: string | null
          id: string
          nome: string
          timestamp_marcado: string | null
          tipo: string | null
        }
        Insert: {
          ambiente?: string | null
          criado_por?: string | null
          dados_contexto?: Json | null
          descricao?: string | null
          id?: string
          nome: string
          timestamp_marcado?: string | null
          tipo?: string | null
        }
        Update: {
          ambiente?: string | null
          criado_por?: string | null
          dados_contexto?: Json | null
          descricao?: string | null
          id?: string
          nome?: string
          timestamp_marcado?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recovery_points_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recovery_points_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      reembolsos: {
        Row: {
          categoria_id: string | null
          contrato_id: string | null
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          obra_id: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          obra_id?: string | null
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          obra_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "reembolsos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      sistema_modulos: {
        Row: {
          ativo: boolean | null
          codigo: string
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          path: string | null
          secao: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          path?: string | null
          secao: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          path?: string | null
          secao?: string
        }
        Relationships: []
      }
      solicitacoes_pagamento: {
        Row: {
          categoria_id: string | null
          contrato_id: string | null
          created_at: string | null
          data_solicitacao: string
          fornecedor: string
          id: string
          obra_id: string | null
          observacoes: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_solicitacao?: string
          fornecedor: string
          id?: string
          obra_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_solicitacao?: string
          fornecedor?: string
          id?: string
          obra_id?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_pagamento_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_pagamento_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_pagamento_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      solicitacoes_pagamento_anexos: {
        Row: {
          arquivo_url: string
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          solicitacao_id: string
          tamanho_bytes: number | null
          tipo: string | null
        }
        Insert: {
          arquivo_url: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          solicitacao_id: string
          tamanho_bytes?: number | null
          tipo?: string | null
        }
        Update: {
          arquivo_url?: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          solicitacao_id?: string
          tamanho_bytes?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_pagamento_anexos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_pagamento_historico: {
        Row: {
          criado_em: string | null
          criado_por: string | null
          id: string
          observacao: string | null
          solicitacao_id: string
          status_anterior:
            | Database["public"]["Enums"]["status_solicitacao_pagamento"]
            | null
          status_novo: Database["public"]["Enums"]["status_solicitacao_pagamento"]
        }
        Insert: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          observacao?: string | null
          solicitacao_id: string
          status_anterior?:
            | Database["public"]["Enums"]["status_solicitacao_pagamento"]
            | null
          status_novo: Database["public"]["Enums"]["status_solicitacao_pagamento"]
        }
        Update: {
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          observacao?: string | null
          solicitacao_id?: string
          status_anterior?:
            | Database["public"]["Enums"]["status_solicitacao_pagamento"]
            | null
          status_novo?: Database["public"]["Enums"]["status_solicitacao_pagamento"]
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_pagamento_historico_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_proposta: {
        Row: {
          ambientes_reforma: string | null
          atualizado_em: string | null
          cep: string | null
          cidade: string | null
          codigo_referencia: string | null
          como_conheceu: string | null
          criado_em: string | null
          email: string
          empreendimento: string | null
          endereco: string | null
          especificador_id: string | null
          especificador_nome: string | null
          estado: string | null
          id: string
          metragem: number | null
          nome: string
          oportunidade_id: string | null
          pessoa_id: string | null
          planta_url: string | null
          reforma_todos_ambientes: boolean | null
          servicos_selecionados: Json | null
          status: string | null
          telefone: string | null
          tem_planta: boolean | null
          tem_projeto_arquitetonico: boolean | null
        }
        Insert: {
          ambientes_reforma?: string | null
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          codigo_referencia?: string | null
          como_conheceu?: string | null
          criado_em?: string | null
          email: string
          empreendimento?: string | null
          endereco?: string | null
          especificador_id?: string | null
          especificador_nome?: string | null
          estado?: string | null
          id?: string
          metragem?: number | null
          nome: string
          oportunidade_id?: string | null
          pessoa_id?: string | null
          planta_url?: string | null
          reforma_todos_ambientes?: boolean | null
          servicos_selecionados?: Json | null
          status?: string | null
          telefone?: string | null
          tem_planta?: boolean | null
          tem_projeto_arquitetonico?: boolean | null
        }
        Update: {
          ambientes_reforma?: string | null
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          codigo_referencia?: string | null
          como_conheceu?: string | null
          criado_em?: string | null
          email?: string
          empreendimento?: string | null
          endereco?: string | null
          especificador_id?: string | null
          especificador_nome?: string | null
          estado?: string | null
          id?: string
          metragem?: number | null
          nome?: string
          oportunidade_id?: string | null
          pessoa_id?: string | null
          planta_url?: string | null
          reforma_todos_ambientes?: boolean | null
          servicos_selecionados?: Json | null
          status?: string | null
          telefone?: string | null
          tem_planta?: boolean | null
          tem_projeto_arquitetonico?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_proposta_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          duration: number
          end_date: string
          id: string
          is_critical: boolean | null
          name: string
          project_id: string
          project_item_id: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: number
          end_date: string
          id?: string
          is_critical?: boolean | null
          name: string
          project_id: string
          project_item_id?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number
          end_date?: string
          id?: string
          is_critical?: boolean | null
          name?: string
          project_id?: string
          project_item_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_item_id_fkey"
            columns: ["project_item_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          cpf: string | null
          created_at: string | null
          function: string
          id: string
          name: string
          phone: string | null
          profile_picture_url: string | null
          rg: string | null
          updated_at: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          function: string
          id?: string
          name: string
          phone?: string | null
          profile_picture_url?: string | null
          rg?: string | null
          updated_at?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          function?: string
          id?: string
          name?: string
          phone?: string | null
          profile_picture_url?: string | null
          rg?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tipos_ambiente: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          codigo: string
          criado_em: string | null
          criado_por: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          codigo?: string
          criado_em?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          atualizado_em: string | null
          atualizado_por: string | null
          auth_user_id: string | null
          cliente_pode_comentar: boolean | null
          cliente_pode_fazer_upload: boolean | null
          cliente_pode_ver_contratos: boolean | null
          cliente_pode_ver_cronograma: boolean | null
          cliente_pode_ver_documentos: boolean | null
          cliente_pode_ver_proposta: boolean | null
          cliente_pode_ver_valores: boolean | null
          cpf: string
          criado_em: string | null
          criado_por: string | null
          dados_confirmados: boolean | null
          dados_confirmados_em: string | null
          email_contato: string | null
          id: string
          nucleo_id: string | null
          pessoa_id: string
          primeiro_acesso: boolean
          senha_temporaria: string | null
          senha_temporaria_expira: string | null
          telefone_whatsapp: string | null
          tipo_usuario: string
          ultimo_acesso: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string | null
          atualizado_por?: string | null
          auth_user_id?: string | null
          cliente_pode_comentar?: boolean | null
          cliente_pode_fazer_upload?: boolean | null
          cliente_pode_ver_contratos?: boolean | null
          cliente_pode_ver_cronograma?: boolean | null
          cliente_pode_ver_documentos?: boolean | null
          cliente_pode_ver_proposta?: boolean | null
          cliente_pode_ver_valores?: boolean | null
          cpf: string
          criado_em?: string | null
          criado_por?: string | null
          dados_confirmados?: boolean | null
          dados_confirmados_em?: string | null
          email_contato?: string | null
          id?: string
          nucleo_id?: string | null
          pessoa_id: string
          primeiro_acesso?: boolean
          senha_temporaria?: string | null
          senha_temporaria_expira?: string | null
          telefone_whatsapp?: string | null
          tipo_usuario: string
          ultimo_acesso?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string | null
          atualizado_por?: string | null
          auth_user_id?: string | null
          cliente_pode_comentar?: boolean | null
          cliente_pode_fazer_upload?: boolean | null
          cliente_pode_ver_contratos?: boolean | null
          cliente_pode_ver_cronograma?: boolean | null
          cliente_pode_ver_documentos?: boolean | null
          cliente_pode_ver_proposta?: boolean | null
          cliente_pode_ver_valores?: boolean | null
          cpf?: string
          criado_em?: string | null
          criado_por?: string | null
          dados_confirmados?: boolean | null
          dados_confirmados_em?: string | null
          email_contato?: string | null
          id?: string
          nucleo_id?: string | null
          pessoa_id?: string
          primeiro_acesso?: boolean
          senha_temporaria?: string | null
          senha_temporaria_expira?: string | null
          telefone_whatsapp?: string | null
          tipo_usuario?: string
          ultimo_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      usuarios_perfis: {
        Row: {
          cargo: string | null
          criado_em: string | null
          id: string
          nome: string | null
          sobrenome: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          cargo?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          cargo?: string | null
          criado_em?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          campos_incluir: string[] | null
          criado_em: string | null
          eventos: string[] | null
          filtro_condicao: string | null
          headers: Json | null
          id: string
          nome: string
          tabela: string
          url: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campos_incluir?: string[] | null
          criado_em?: string | null
          eventos?: string[] | null
          filtro_condicao?: string | null
          headers?: Json | null
          id?: string
          nome: string
          tabela: string
          url: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campos_incluir?: string[] | null
          criado_em?: string | null
          eventos?: string[] | null
          filtro_condicao?: string | null
          headers?: Json | null
          id?: string
          nome?: string
          tabela?: string
          url?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          criado_em: string | null
          enviado_em: string | null
          evento: string
          id: string
          payload: Json | null
          registro_id: string | null
          resposta: Json | null
          status: string | null
          tabela: string
          tentativas: number | null
          webhook_url: string | null
        }
        Insert: {
          criado_em?: string | null
          enviado_em?: string | null
          evento: string
          id?: string
          payload?: Json | null
          registro_id?: string | null
          resposta?: Json | null
          status?: string | null
          tabela: string
          tentativas?: number | null
          webhook_url?: string | null
        }
        Update: {
          criado_em?: string | null
          enviado_em?: string | null
          evento?: string
          id?: string
          payload?: Json | null
          registro_id?: string | null
          resposta?: Json | null
          status?: string | null
          tabela?: string
          tentativas?: number | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_comercial: {
        Row: {
          em_negociacao: number | null
          em_proposta: number | null
          total_oportunidades: number | null
          valor_ganho: number | null
          valor_perdido: number | null
          valor_total: number | null
        }
        Relationships: []
      }
      dashboard_comercial_forecast_mensal: {
        Row: {
          mes: string | null
          qtde: number | null
          valor: number | null
        }
        Relationships: []
      }
      dashboard_comercial_por_estagio: {
        Row: {
          estagio: string | null
          qtde: number | null
          valor: number | null
        }
        Relationships: []
      }
      dashboard_comercial_resumo: {
        Row: {
          oportunidades_ganhas: number | null
          oportunidades_perdidas: number | null
          taxa_conversao: number | null
          ticket_medio: number | null
          total_oportunidades: number | null
          valor_ganho: number | null
          valor_perdido: number | null
          valor_total: number | null
        }
        Relationships: []
      }
      dashboard_por_estagio: {
        Row: {
          estagio: string | null
          qtde: number | null
          valor: number | null
        }
        Relationships: []
      }
      pipeline_wg_view: {
        Row: {
          cliente: string | null
          created_at: string | null
          id: string | null
          prazo: string | null
          prazo_label: string | null
          progresso: number | null
          status: Database["public"]["Enums"]["status_item_wg"] | null
          tipo: Database["public"]["Enums"]["tipo_item_wg"] | null
          titulo: string | null
          unidade: Database["public"]["Enums"]["unidade_wg"] | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          cliente?: string | null
          created_at?: string | null
          id?: string | null
          prazo?: string | null
          prazo_label?: string | null
          progresso?: number | null
          status?: Database["public"]["Enums"]["status_item_wg"] | null
          tipo?: Database["public"]["Enums"]["tipo_item_wg"] | null
          titulo?: string | null
          unidade?: Database["public"]["Enums"]["unidade_wg"] | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          cliente?: string | null
          created_at?: string | null
          id?: string | null
          prazo?: string | null
          prazo_label?: string | null
          progresso?: number | null
          status?: Database["public"]["Enums"]["status_item_wg"] | null
          tipo?: Database["public"]["Enums"]["tipo_item_wg"] | null
          titulo?: string | null
          unidade?: Database["public"]["Enums"]["unidade_wg"] | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      v_lista_compras_completa: {
        Row: {
          ambiente: string | null
          categoria: string | null
          cliente_nome: string | null
          contrato_numero: string | null
          data_aprovacao: string | null
          data_compra: string | null
          data_entrega: string | null
          descricao: string | null
          fabricante: string | null
          fornecedor: string | null
          id: string | null
          imagem_url: string | null
          is_complementar: boolean | null
          item: string | null
          linha: string | null
          link_produto: string | null
          modelo: string | null
          observacoes: string | null
          preco_unit: number | null
          produto_codigo: string | null
          projeto_id: string | null
          projeto_nome: string | null
          qtd_compra: number | null
          status: string | null
          taxa_fee_percent: number | null
          tipo_compra: string | null
          tipo_conta: string | null
          unidade: string | null
          valor_fee: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "lista_compras_itens_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      v_lista_compras_dashboard: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          conta_real: number | null
          conta_virtual: number | null
          contrato_numero: string | null
          projeto_id: string | null
          projeto_nome: string | null
          total_cliente_direto: number | null
          total_fee: number | null
          total_itens: number | null
          total_wg_compra: number | null
          valor_aprovado: number | null
          valor_comprado: number | null
          valor_entregue: number | null
          valor_pendente: number | null
          valor_total_lista: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      v_lista_compras_separacao_fiscal: {
        Row: {
          tipo_conta: string | null
          total_cliente_direto: number | null
          total_compras_wg: number | null
          total_fee: number | null
          total_itens: number | null
          total_liquido: number | null
        }
        Relationships: []
      }
      v_obras_etapas_completo: {
        Row: {
          alertas_pendentes: number | null
          checklist_concluidos: number | null
          cliente_nome: string | null
          criado_em: string | null
          criado_por: string | null
          data_conclusao: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          data_inicio_real: string | null
          dias_atraso: number | null
          etapa: string | null
          etapa_pai_id: string | null
          id: string | null
          obra_id: string | null
          obra_nome: string | null
          observacoes: string | null
          percentual_concluido: number | null
          responsavel_id: string | null
          status: string | null
          tipo: string | null
          total_assinaturas: number | null
          total_checklist: number | null
          total_evidencias: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_etapa_pai"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "obras_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_etapa_pai"
            columns: ["etapa_pai_id"]
            isOneToOne: false
            referencedRelation: "v_obras_etapas_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      v_obras_financeiro_resumo: {
        Row: {
          empresa_id: string | null
          obra_id: string | null
          obra_nome: string | null
          obra_status: string | null
          saldo_obra: number | null
          total_entradas: number | null
          total_saidas: number | null
        }
        Relationships: []
      }
      v_oportunidades_checklist_resumo: {
        Row: {
          checklist_concluidos: number | null
          obrigatorios_pendentes: number | null
          oportunidade_id: string | null
          percentual_concluido: number | null
          total_checklist: number | null
        }
        Relationships: []
      }
      v_oportunidades_completo: {
        Row: {
          atualizado_em: string | null
          cliente_cidade: string | null
          cliente_email: string | null
          cliente_estado: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          criado_em: string | null
          data_abertura: string | null
          data_fechamento_prevista: string | null
          data_fechamento_real: string | null
          descricao: string | null
          estagio: string | null
          id: string | null
          observacoes: string | null
          origem: string | null
          probabilidade: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          titulo: string | null
          unidades_negocio: string[] | null
          valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      v_ordens_servico_completas: {
        Row: {
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          contrato_id: string | null
          contrato_numero: string | null
          created_at: string | null
          created_by: string | null
          data_abertura: string | null
          data_conclusao: string | null
          data_previsao: string | null
          descricao: string | null
          endereco_atendimento: string | null
          id: string | null
          numero: string | null
          observacoes: string | null
          prioridade: string | null
          solucao: string | null
          status: string | null
          tecnico_nome: string | null
          tecnico_responsavel_id: string | null
          tipo_atendimento: string | null
          titulo: string | null
          total_historico: number | null
          total_itens: number | null
          updated_at: string | null
          updated_by: string | null
          valor_aprovado_cliente: boolean | null
          valor_mao_obra: number | null
          valor_pecas: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "ordens_servico_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tecnico_responsavel_id_fkey"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      v_pessoas_stats: {
        Row: {
          ativos: number | null
          inativos: number | null
          tipo: string | null
          total: number | null
        }
        Relationships: []
      }
      v_pricelist_completo: {
        Row: {
          ativo: boolean | null
          categoria_nome: string | null
          categoria_tipo: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          fornecedor_nome: string | null
          fornecedor_telefone: string | null
          id: string | null
          marca: string | null
          margem_percentual: number | null
          nome: string | null
          preco: number | null
          preco_custo: number | null
          tipo: string | null
          unidade: string | null
        }
        Relationships: []
      }
      view_arquivos_completo: {
        Row: {
          altura: number | null
          atualizado_em: string | null
          bucket: string | null
          criado_em: string | null
          entidade_id: string | null
          entidade_tipo: string | null
          id: string | null
          largura: number | null
          nome_original: string | null
          path: string | null
          tamanho_bytes: number | null
          temporario: boolean | null
          tipo_mime: string | null
          upload_por: string | null
          upload_por_nome: string | null
          url_large: string | null
          url_medium: string | null
          url_original: string | null
          url_small: string | null
          url_thumbnail: string | null
          urls: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_metadata_upload_por_fkey"
            columns: ["upload_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_metadata_upload_por_fkey"
            columns: ["upload_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      view_atividades_recentes: {
        Row: {
          campos_alterados: string[] | null
          criado_em: string | null
          descricao_registro: string | null
          operacao: string | null
          registro_id: string | null
          tabela: string | null
          usuario_email: string | null
        }
        Relationships: []
      }
      view_compartilhamentos_completos: {
        Row: {
          acessos: number | null
          agencia: string | null
          agencia_digito: string | null
          ativo: boolean | null
          bairro: string | null
          banco_codigo: string | null
          banco_nome: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          conta: string | null
          conta_apelido: string | null
          conta_digito: string | null
          conta_id: string | null
          criado_em: string | null
          destinatario_email: string | null
          destinatario_nome: string | null
          destinatario_tipo: string | null
          empresa_email: string | null
          empresa_id: string | null
          empresa_telefone: string | null
          estado: string | null
          exibir_contato: boolean | null
          exibir_dados_bancarios: boolean | null
          exibir_empresa: boolean | null
          exibir_endereco: boolean | null
          expira_em: string | null
          expirado: boolean | null
          id: string | null
          limite_acessos: number | null
          limite_atingido: boolean | null
          logradouro: string | null
          nome_fantasia: string | null
          numero: string | null
          pix_chave: string | null
          pix_tipo: string | null
          razao_social: string | null
          tipo_conta: string | null
          token: string | null
          ultimo_acesso_em: string | null
          ultimo_acesso_ip: string | null
        }
        Relationships: []
      }
      view_cron_status: {
        Row: {
          execucoes_erro: number | null
          execucoes_sucesso: number | null
          job_name: string | null
          tempo_medio_ms: number | null
          total_registros_afetados: number | null
          ultima_execucao_sucesso: string | null
          ultimo_erro: string | null
        }
        Relationships: []
      }
      view_dados_bancarios_nucleos: {
        Row: {
          agencia: string | null
          agencia_digito: string | null
          apelido: string | null
          banco_codigo: string | null
          banco_nome: string | null
          cnpj: string | null
          conta: string | null
          conta_digito: string | null
          conta_id: string | null
          empresa_id: string | null
          nome_fantasia: string | null
          nucleo_cor: string | null
          nucleo_id: string | null
          nucleo_nome: string | null
          padrao: boolean | null
          pix_chave: string | null
          pix_tipo: string | null
          razao_social: string | null
          tipo_conta: string | null
        }
        Relationships: []
      }
      view_deposito_estoque_baixo: {
        Row: {
          codigo: string | null
          diferenca: number | null
          estoque_minimo: number | null
          nucleo_id: string | null
          produto_id: string | null
          produto_nome: string | null
          quantidade_disponivel: number | null
          unidade: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      view_deposito_estoque_consolidado: {
        Row: {
          codigo: string | null
          custo_medio: number | null
          locais_count: number | null
          nucleo_id: string | null
          produto_id: string | null
          produto_nome: string | null
          quantidade_disponivel_total: number | null
          quantidade_reservada_total: number | null
          quantidade_total: number | null
          unidade: string | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposito_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      view_kanban_arquitetura: {
        Row: {
          area_total: number | null
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          contrato_numero: string | null
          contrato_titulo: string | null
          criado_em: string | null
          dados_especificos: Json | null
          data_inicio: string | null
          data_previsao: string | null
          endereco_obra: string | null
          id: string | null
          observacoes: string | null
          oportunidade_id: string | null
          oportunidade_titulo: string | null
          progresso: number | null
          responsavel_nome: string | null
          status_kanban: string | null
          tipo_projeto: string | null
          valor_executado: number | null
          valor_previsto: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      view_kanban_engenharia: {
        Row: {
          area_total: number | null
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          contrato_numero: string | null
          contrato_titulo: string | null
          criado_em: string | null
          dados_especificos: Json | null
          data_inicio: string | null
          data_previsao: string | null
          endereco_obra: string | null
          id: string | null
          observacoes: string | null
          oportunidade_id: string | null
          oportunidade_titulo: string | null
          progresso: number | null
          responsavel_nome: string | null
          status_kanban: string | null
          tipo_projeto: string | null
          valor_executado: number | null
          valor_previsto: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      view_kanban_marcenaria: {
        Row: {
          area_total: number | null
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          contrato_numero: string | null
          contrato_titulo: string | null
          criado_em: string | null
          dados_especificos: Json | null
          data_inicio: string | null
          data_previsao: string | null
          endereco_obra: string | null
          id: string | null
          observacoes: string | null
          oportunidade_id: string | null
          oportunidade_titulo: string | null
          progresso: number | null
          responsavel_nome: string | null
          status_kanban: string | null
          tipo_projeto: string | null
          valor_executado: number | null
          valor_previsto: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "contratos_nucleos_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      view_propostas_totais_ambientes: {
        Row: {
          proposta_id: string | null
          total_area_parede: number | null
          total_area_piso: number | null
          total_perimetro: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      view_propostas_totais_por_nucleo: {
        Row: {
          cor: string | null
          descricao_cor: string | null
          nucleo_id: string | null
          nucleo_nome: string | null
          proposta_id: string | null
          total_nucleo: number | null
        }
        Relationships: []
      }
      view_timeline_cliente: {
        Row: {
          arquivo_tipo: string | null
          arquivo_url: string | null
          cliente_id: string | null
          cliente_nome: string | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          id: string | null
          nucleo: string | null
          oportunidade_id: string | null
          oportunidade_titulo: string | null
          tipo: string | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "oportunidade_timeline_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      view_usuarios_online: {
        Row: {
          avatar_url: string | null
          email: string | null
          nome: string | null
          pagina_atual: string | null
          segundos_inativo: number | null
          status: string | null
          ultimo_heartbeat: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "realtime_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      view_webhook_status: {
        Row: {
          enviados: number | null
          erros: number | null
          evento: string | null
          pendentes: number | null
          tabela: string | null
          ultimo_envio: string | null
          ultimo_evento: string | null
        }
        Relationships: []
      }
      vw_acabamentos_por_projeto: {
        Row: {
          area_total_m2: number | null
          metragem_total: number | null
          nucleo_nome: string | null
          projeto_id: string | null
          projeto_nome: string | null
          tipo_acabamento: string | null
          total_itens: number | null
          valor_total: number | null
        }
        Relationships: []
      }
      vw_analises_projeto_completas: {
        Row: {
          analise_ia: Json | null
          area_total: number | null
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          confiabilidade_analise: number | null
          contrato_texto: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          endereco_obra: string | null
          id: string | null
          memorial_descritivo: string | null
          modelo_ia: string | null
          numero: string | null
          oportunidade_id: string | null
          oportunidade_titulo: string | null
          padrao_construtivo: string | null
          pe_direito_padrao: number | null
          plantas_urls: Json | null
          prompt_utilizado: string | null
          proposta_id: string | null
          proposta_numero: string | null
          proposta_titulo: string | null
          provedor_ia: string | null
          status: string | null
          tempo_processamento_ms: number | null
          tipo_imovel: string | null
          tipo_projeto: string | null
          titulo: string | null
          total_ambientes: number | null
          total_area_paredes: number | null
          total_area_piso: number | null
          total_perimetro: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_checklist_resumo"
            referencedColumns: ["oportunidade_id"]
          },
          {
            foreignKeyName: "analises_projeto_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "v_oportunidades_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_projeto_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      vw_assistencia_ordens_compat: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          data_abertura: string | null
          data_conclusao: string | null
          data_previsao: string | null
          descricao: string | null
          id: string | null
          prioridade: string | null
          status: string | null
          tecnico_responsavel_id: string | null
          titulo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: never
          created_by?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao?: string | null
          id?: string | null
          prioridade?: string | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          titulo?: string | null
          updated_at?: never
          updated_by?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: never
          created_by?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_previsao?: string | null
          descricao?: string | null
          id?: string | null
          prioridade?: string | null
          status?: string | null
          tecnico_responsavel_id?: string | null
          titulo?: string | null
          updated_at?: never
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assistencia_tecnico"
            columns: ["tecnico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      vw_cadastros_pendentes: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          criado_em: string | null
          email: string | null
          empresa: string | null
          endereco: string | null
          enviado_por: string | null
          enviado_por_nome: string | null
          enviado_por_tipo: string | null
          enviado_via: string | null
          estado: string | null
          expira_em: string | null
          id: string | null
          link_pai_id: string | null
          link_pai_token: string | null
          motivo_rejeicao: string | null
          nome: string | null
          nucleo_id: string | null
          observacoes: string | null
          pessoa_id: string | null
          preenchido_em: string | null
          reutilizavel: boolean | null
          status: string | null
          telefone: string | null
          tipo_solicitado: string | null
          tipo_usuario_aprovado: string | null
          token: string | null
          total_usos: number | null
          uso_maximo: number | null
          usuario_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadastros_pendentes_link_pai_id_fkey"
            columns: ["link_pai_id"]
            isOneToOne: false
            referencedRelation: "cadastros_pendentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cadastros_pendentes_link_pai_id_fkey"
            columns: ["link_pai_id"]
            isOneToOne: false
            referencedRelation: "vw_cadastros_pendentes"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_clientes: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          bairro: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          foto_url: string | null
          id: string | null
          logradouro: string | null
          nome: string | null
          numero: string | null
          observacoes: string | null
          pais: string | null
          telefone: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          telefone?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_clientes_completos: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          atualizado_em: string | null
          avatar: string | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          conta: string | null
          contato_responsavel: string | null
          cpf: string | null
          created_at: string | null
          criado_em: string | null
          custo_diaria: number | null
          custo_hora: number | null
          dados_bancarios: Json | null
          email: string | null
          empresa: string | null
          estado: string | null
          estado_civil: string | null
          foto_url: string | null
          id: string | null
          logradouro: string | null
          modelo_profissional: string | null
          nacionalidade: string | null
          nome: string | null
          numero: string | null
          obra_bairro: string | null
          obra_cep: string | null
          obra_cidade: string | null
          obra_complemento: string | null
          obra_endereco_diferente: boolean | null
          obra_estado: string | null
          obra_logradouro: string | null
          obra_numero: string | null
          observacoes: string | null
          pais: string | null
          pix: string | null
          profissao: string | null
          rg: string | null
          telefone: string | null
          tipo: string | null
          tipo_conta: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome?: string | null
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome?: string | null
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_colaboradores: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          bairro: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          custo_diaria: number | null
          custo_hora: number | null
          email: string | null
          empresa: string | null
          estado: string | null
          foto_url: string | null
          id: string | null
          logradouro: string | null
          modelo_profissional: string | null
          nome: string | null
          numero: string | null
          observacoes: string | null
          telefone: string | null
          tipo: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_colaboradores_completo: {
        Row: {
          ativo: boolean | null
          auth_user_id: string | null
          avatar_url: string | null
          cargo: string | null
          cpf: string | null
          email: string | null
          id: string | null
          nivel_hierarquico: number | null
          nome: string | null
          perfil_codigo: string | null
          perfil_nome: string | null
          telefone: string | null
          tipo_usuario: string | null
          total_projetos: number | null
          valor_previsto: number | null
          valor_recebido: number | null
        }
        Relationships: []
      }
      vw_cotacoes_fornecedor: {
        Row: {
          categoria: string | null
          data_limite: string | null
          descricao: string | null
          exige_visita_tecnica: boolean | null
          fornecedor_id: string | null
          id: string | null
          numero_cotacao: string | null
          participando: boolean | null
          permite_proposta_parcial: boolean | null
          prazo_execucao_dias: number | null
          projeto_nome: string | null
          proposta_id: string | null
          proposta_status:
            | Database["public"]["Enums"]["status_proposta_fornecedor"]
            | null
          proposta_valor: number | null
          status: Database["public"]["Enums"]["status_cotacao"] | null
          titulo: string | null
          visualizado: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacao_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      vw_despesas_por_contrato_nucleo: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          contrato_id: string | null
          contrato_numero: string | null
          total_despesas: number | null
          unidade_negocio: string | null
          valor_pago: number | null
          valor_pendente: number | null
          valor_total_despesas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contratos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      vw_elementos_por_projeto: {
        Row: {
          nucleo_nome: string | null
          projeto_id: string | null
          projeto_nome: string | null
          quantidade_total: number | null
          tipo_elemento: string | null
          total_elementos: number | null
        }
        Relationships: []
      }
      vw_fees_gestao_contrato: {
        Row: {
          contrato_id: string | null
          fee_medio: number | null
          nucleo: string | null
          qtd_compras: number | null
          total_compras: number | null
          total_fees: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "contratos_compras_gerenciadas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      vw_financeiro_contas_virtual_resumo: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string | null
          moeda: string | null
          referencia_id: string | null
          referencia_nome: string | null
          saldo_atual: number | null
          tipo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conta_virtual_pessoa"
            columns: ["referencia_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
      vw_financeiro_virtual_resumo: {
        Row: {
          ativo: boolean | null
          conta_virtual_id: string | null
          contrato_descricao: string | null
          contrato_id: string | null
          fee_percent: number | null
          moeda: string | null
          nucleo: string | null
          saldo_atual: number | null
          saldo_inicial: number | null
          saldo_movimentos: number | null
          tipo_fluxo: string | null
          total_fees: number | null
          total_movimentos: number | null
        }
        Relationships: []
      }
      vw_financeiro_virtual_saldos: {
        Row: {
          entidade_id: string | null
          entidade_tipo: string | null
          id: string | null
          moeda: string | null
          nome: string | null
          saldo_atual: number | null
        }
        Relationships: []
      }
      vw_fluxo_caixa_cliente_nucleo: {
        Row: {
          cliente_nome: string | null
          contrato_id: string | null
          contrato_numero: string | null
          criado_em: string | null
          data_competencia: string | null
          descricao: string | null
          id: string | null
          pessoa_id: string | null
          status: string | null
          tipo: string | null
          unidade_negocio: string | null
          valor_total: number | null
        }
        Relationships: []
      }
      vw_fornecedores: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          conta: string | null
          contato_responsavel: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          foto_url: string | null
          id: string | null
          logradouro: string | null
          nome: string | null
          numero: string | null
          observacoes: string | null
          pais: string | null
          pix: string | null
          telefone: string | null
          tipo: string | null
          tipo_conta: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          nome?: string | null
          numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_fornecedores_completo: {
        Row: {
          ativo: boolean | null
          auth_user_id: string | null
          avatar_url: string | null
          categorias: string[] | null
          cpf: string | null
          email: string | null
          empresa: string | null
          id: string | null
          nome: string | null
          telefone: string | null
          total_servicos: number | null
          valor_total_contratado: number | null
          valor_total_pago: number | null
        }
        Relationships: []
      }
      vw_fornecedores_completos: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          atualizado_em: string | null
          avatar: string | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          cargo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          conta: string | null
          contato_responsavel: string | null
          cpf: string | null
          created_at: string | null
          criado_em: string | null
          custo_diaria: number | null
          custo_hora: number | null
          dados_bancarios: Json | null
          email: string | null
          empresa: string | null
          estado: string | null
          estado_civil: string | null
          foto_url: string | null
          id: string | null
          logradouro: string | null
          modelo_profissional: string | null
          nacionalidade: string | null
          nome: string | null
          numero: string | null
          obra_bairro: string | null
          obra_cep: string | null
          obra_cidade: string | null
          obra_complemento: string | null
          obra_endereco_diferente: boolean | null
          obra_estado: string | null
          obra_logradouro: string | null
          obra_numero: string | null
          observacoes: string | null
          pais: string | null
          pix: string | null
          profissao: string | null
          rg: string | null
          telefone: string | null
          tipo: string | null
          tipo_conta: string | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome?: string | null
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          conta?: string | null
          contato_responsavel?: string | null
          cpf?: string | null
          created_at?: string | null
          criado_em?: string | null
          custo_diaria?: number | null
          custo_hora?: number | null
          dados_bancarios?: Json | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string | null
          logradouro?: string | null
          modelo_profissional?: string | null
          nacionalidade?: string | null
          nome?: string | null
          numero?: string | null
          obra_bairro?: string | null
          obra_cep?: string | null
          obra_cidade?: string | null
          obra_complemento?: string | null
          obra_endereco_diferente?: boolean | null
          obra_estado?: string | null
          obra_logradouro?: string | null
          obra_numero?: string | null
          observacoes?: string | null
          pais?: string | null
          pix?: string | null
          profissao?: string | null
          rg?: string | null
          telefone?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_historico_analises_ia: {
        Row: {
          acabamentos_detectados: number | null
          ambientes_detectados: number | null
          arquivo_nome: string | null
          criado_em: string | null
          elementos_detectados: number | null
          id: string | null
          modelo_ia: string | null
          nucleo_nome: string | null
          projeto_nome: string | null
          projeto_numero: string | null
          provedor_ia: string | null
          status: string | null
          tempo_processamento_ms: number | null
          tipo_analise: string | null
          usuario_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_analises_ia_criado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_analises_ia_criado_por_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_memorial_completo: {
        Row: {
          ambiente: string | null
          assunto: string | null
          categoria: string | null
          codigo_fabricante: string | null
          created_at: string | null
          fabricante: string | null
          id: string | null
          item: string | null
          modelo: string | null
          observacoes: string | null
          ordem: number | null
          preco_total: number | null
          preco_unitario: number | null
          pricelist_codigo: string | null
          pricelist_item_id: string | null
          pricelist_nome: string | null
          projeto_id: string | null
          quantidade: number | null
          status: string | null
          unidade: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_memorial_resumo_ambiente: {
        Row: {
          ambiente: string | null
          itens_aprovados: number | null
          itens_especificados: number | null
          itens_pendentes: number | null
          projeto_id: string | null
          total_itens: number | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "memorial_acabamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_orcamentos_pendentes_aprovacao: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          atualizado_em: string | null
          cliente: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          criado_em: string | null
          criado_por: string | null
          data_validade: string | null
          descricao: string | null
          enviado_em: string | null
          expirado: boolean | null
          id: string | null
          imposto: number | null
          link_aprovacao: string | null
          margem: number | null
          motivo_rejeicao: string | null
          nucleo_id: string | null
          numero: string | null
          obra_id: string | null
          observacoes: string | null
          observacoes_cliente: string | null
          rejeitado_em: string | null
          status: string | null
          titulo: string | null
          total_itens: number | null
          validade: string | null
          valor_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "orcamentos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "v_obras_financeiro_resumo"
            referencedColumns: ["obra_id"]
          },
        ]
      }
      vw_pessoas_compat: {
        Row: {
          atualizado_em: string | null
          avatar_url: string | null
          criado_em: string | null
          drive_link: string | null
          email: string | null
          foto_url: string | null
          id: string | null
          nome: string | null
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          atualizado_em?: string | null
          avatar_url?: string | null
          criado_em?: string | null
          drive_link?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string | null
          nome?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          atualizado_em?: string | null
          avatar_url?: string | null
          criado_em?: string | null
          drive_link?: string | null
          email?: string | null
          foto_url?: string | null
          id?: string | null
          nome?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      vw_pricelist_itens_completo: {
        Row: {
          acabamento: string | null
          ambiente: string | null
          aplicacao: string | null
          ativo: boolean | null
          avaliacao: number | null
          borda: string | null
          categoria: string | null
          categoria_codigo: string | null
          categoria_id: string | null
          categoria_nome: string | null
          codigo: string | null
          codigo_fabricante: string | null
          comprimento: number | null
          controla_estoque: boolean | null
          cor: string | null
          created_at: string | null
          criado_em: string | null
          custo_aquisicao: number | null
          custo_operacional: number | null
          descricao: string | null
          destaque: boolean | null
          dimensoes_formatadas: string | null
          especificacoes: Json | null
          espessura: number | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fabricante: string | null
          ficha_tecnica_url: string | null
          formato: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          id: string | null
          imagem_url: string | null
          largura: number | null
          linha: string | null
          link_produto: string | null
          lucro_estimado: number | null
          m2_caixa: number | null
          m2_peca: number | null
          marca: string | null
          margem_lucro: number | null
          margem_percentual: number | null
          markup: number | null
          modelo: string | null
          multiplo_venda: number | null
          nome: string | null
          nucleo: string | null
          nucleo_id: string | null
          peso: number | null
          preco: number | null
          preco_caixa: number | null
          preco_com_desconto: number | null
          preco_custo: number | null
          preco_final: number | null
          preco_m2: number | null
          preco_m2_calculado: number | null
          preco_minimo: number | null
          preco_venda: number | null
          producao_diaria: number | null
          rendimento: number | null
          resistencia: string | null
          subcategoria_id: string | null
          subcategoria_nome: string | null
          tipo: string | null
          total_avaliacoes: number | null
          ultima_atualizacao_preco: string | null
          unidade: string | null
          unidade_estoque: string | null
          unidade_venda: string | null
          unidades_caixa: number | null
          updated_at: string | null
          url_referencia: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "pricelist_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "pricelist_itens_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "pricelist_itens_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "pricelist_subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_pricelist_margem: {
        Row: {
          categoria: string | null
          codigo: string | null
          id: string | null
          lucro_bruto: number | null
          margem_percentual: number | null
          nome: string | null
          nucleo: string | null
          preco_custo: number | null
          preco_venda: number | null
          status_margem: string | null
          unidade: string | null
        }
        Relationships: []
      }
      vw_pricelist_rentabilidade: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string | null
          created_at: string | null
          custo_aquisicao: number | null
          custo_operacional: number | null
          custo_total: number | null
          id: string | null
          lucro_estimado: number | null
          margem_lucro: number | null
          margem_real_percentual: number | null
          markup: number | null
          nome: string | null
          nucleo: string | null
          preco_abaixo_minimo: boolean | null
          preco_minimo: number | null
          preco_venda: number | null
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          custo_aquisicao?: number | null
          custo_operacional?: number | null
          custo_total?: never
          id?: string | null
          lucro_estimado?: number | null
          margem_lucro?: number | null
          margem_real_percentual?: never
          markup?: number | null
          nome?: string | null
          nucleo?: string | null
          preco_abaixo_minimo?: never
          preco_minimo?: number | null
          preco_venda?: number | null
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          custo_aquisicao?: number | null
          custo_operacional?: number | null
          custo_total?: never
          id?: string | null
          lucro_estimado?: number | null
          margem_lucro?: number | null
          margem_real_percentual?: never
          markup?: number | null
          nome?: string | null
          nucleo?: string | null
          preco_abaixo_minimo?: never
          preco_minimo?: number | null
          preco_venda?: number | null
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_projeto_equipes_completa: {
        Row: {
          created_at: string | null
          custo_hora: number | null
          custo_total: number | null
          data_atribuicao: string | null
          data_fim_alocacao: string | null
          data_inicio_alocacao: string | null
          funcao: string | null
          horas_alocadas: number | null
          id: string | null
          is_responsavel: boolean | null
          pessoa_email: string | null
          pessoa_id: string | null
          pessoa_nome: string | null
          pessoa_profissao: string | null
          pessoa_telefone: string | null
          pessoa_tipo: string | null
          projeto_id: string | null
          projeto_nome: string | null
          tarefa_id: string | null
          tarefa_titulo: string | null
          tipo_pessoa: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "v_lista_compras_dashboard"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "projeto_equipes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_projetos_cronograma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_equipes_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "cronograma_tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_projetos_cronograma: {
        Row: {
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          contrato_id: string | null
          contrato_numero: string | null
          contrato_valor: number | null
          created_at: string | null
          data_inicio: string | null
          data_termino: string | null
          descricao: string | null
          id: string | null
          progresso: number | null
          status: string | null
          tarefas_concluidas: number | null
          tipo_projeto: string | null
          titulo: string | null
          total_tarefas: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
        ]
      }
      vw_propostas_ambientes_resumo: {
        Row: {
          area_parede: number | null
          area_piso: number | null
          area_teto: number | null
          atualizado_em: string | null
          comprimento: number | null
          criado_em: string | null
          criado_por: string | null
          id: string | null
          largura: number | null
          nome: string | null
          nucleo_id: string | null
          observacoes: string | null
          ordem: number | null
          pe_direito: number | null
          perimetro: number | null
          proposta_id: string | null
          proposta_numero: string | null
          proposta_status: string | null
          proposta_titulo: string | null
          total_itens: number | null
          valor_total_itens: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_ambientes_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_ambientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      vw_quantitativos_itens_completo: {
        Row: {
          ambiente_codigo: string | null
          ambiente_nome: string | null
          atualizado_em: string | null
          categoria_cor: string | null
          categoria_id: string | null
          categoria_nome: string | null
          codigo: string | null
          criado_em: string | null
          descricao: string | null
          especificacao: string | null
          id: string | null
          nome: string | null
          observacoes: string | null
          ordem: number | null
          preco_total: number | null
          preco_total_efetivo: number | null
          preco_unitario: number | null
          preco_unitario_efetivo: number | null
          pricelist_item_id: string | null
          pricelist_nome: string | null
          pricelist_preco: number | null
          pricelist_unidade: string | null
          projeto_nome: string | null
          projeto_numero: string | null
          quantidade: number | null
          sincronizar_preco: boolean | null
          unidade: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "quantitativos_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "pricelist_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "v_pricelist_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_itens_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_margem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_itens_pricelist_item_id_fkey"
            columns: ["pricelist_item_id"]
            isOneToOne: false
            referencedRelation: "vw_pricelist_rentabilidade"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_quantitativos_projetos_resumo: {
        Row: {
          area_construida: number | null
          area_total: number | null
          atualizado_em: string | null
          atualizado_por: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          contrato_id: string | null
          criado_em: string | null
          criado_por: string | null
          descricao: string | null
          endereco_obra: string | null
          id: string | null
          nome: string | null
          nucleo: string | null
          nucleo_id: string | null
          nucleo_nome: string | null
          numero: string | null
          observacoes: string | null
          proposta_id: string | null
          status: string | null
          total_ambientes: number | null
          total_categorias: number | null
          total_itens: number | null
          valor_total: number | null
          versao: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quantitativos_projetos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_despesas_por_contrato_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["contrato_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_usuarios_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantitativos_projetos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["proposta_id"]
          },
        ]
      }
      vw_receitas_por_cliente_nucleo: {
        Row: {
          cliente_nome: string | null
          pessoa_id: string | null
          total_lancamentos: number | null
          unidade_negocio: string | null
          valor_atrasado: number | null
          valor_previsto: number | null
          valor_recebido: number | null
          valor_total: number | null
        }
        Relationships: []
      }
      vw_resumo_financeiro_nucleo: {
        Row: {
          saldo: number | null
          total_despesas: number | null
          total_receitas: number | null
          unidade_negocio: string | null
          valor_despesas: number | null
          valor_receitas: number | null
        }
        Relationships: []
      }
      vw_usuarios_completo: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          auth_user_id: string | null
          avatar_url: string | null
          cargo: string | null
          cliente_pode_comentar: boolean | null
          cliente_pode_fazer_upload: boolean | null
          cliente_pode_ver_contratos: boolean | null
          cliente_pode_ver_cronograma: boolean | null
          cliente_pode_ver_documentos: boolean | null
          cliente_pode_ver_proposta: boolean | null
          cliente_pode_ver_valores: boolean | null
          cpf: string | null
          criado_em: string | null
          email: string | null
          email_contato: string | null
          empresa: string | null
          id: string | null
          nome: string | null
          nucleo_id: string | null
          pessoa_id: string | null
          primeiro_acesso: boolean | null
          telefone: string | null
          telefone_whatsapp: string | null
          tipo_pessoa: string | null
          tipo_usuario: string | null
          ultimo_acesso: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_dados_bancarios_nucleos"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "usuarios_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "view_propostas_totais_por_nucleo"
            referencedColumns: ["nucleo_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "view_timeline_cliente"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_clientes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_colaboradores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fluxo_caixa_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_fornecedores_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_pessoas_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: true
            referencedRelation: "vw_receitas_por_cliente_nucleo"
            referencedColumns: ["pessoa_id"]
          },
        ]
      }
    }
    Functions: {
      aplicar_template_checklist: {
        Args: { p_oportunidade_id: string; p_template_id: string }
        Returns: string
      }
      aprovar_cadastro: {
        Args: {
          p_aprovado_por: string
          p_cadastro_id: string
          p_categoria_comissao_id?: string
          p_indicado_por_id?: string
          p_is_master?: boolean
          p_tipo_usuario: string
        }
        Returns: Json
      }
      atualizar_avatar_pessoa: {
        Args: { p_bucket: string; p_path: string; p_pessoa_id: string }
        Returns: undefined
      }
      atualizar_presenca: {
        Args: { p_dados?: Json; p_pagina?: string; p_status?: string }
        Returns: undefined
      }
      broadcast_notificacao: {
        Args: {
          p_dados?: Json
          p_destinatario_ids: string[]
          p_mensagem: string
          p_tipo: string
          p_titulo: string
        }
        Returns: undefined
      }
      buscar_cliente_area: { Args: { p_cliente_id: string }; Returns: Json }
      buscar_contratos_cliente_area: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      buscar_cronograma_cliente_area: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      buscar_dados_area_cliente: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      buscar_equipe_cliente_area: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      buscar_financeiro_cliente_area: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      buscar_produtos_lista_compras: {
        Args: { termo: string }
        Returns: {
          codigo: string
          descricao: string
          fabricante: string
          id: string
          imagem_url: string
          modelo: string
          nome: string
          preco: number
          unidade: string
        }[]
      }
      buscar_usuario_por_cpf: {
        Args: { p_cpf: string }
        Returns: {
          ativo: boolean
          auth_user_id: string
          cliente_pode_comentar: boolean
          cliente_pode_fazer_upload: boolean
          cliente_pode_ver_contratos: boolean
          cliente_pode_ver_cronograma: boolean
          cliente_pode_ver_documentos: boolean
          cliente_pode_ver_proposta: boolean
          cliente_pode_ver_valores: boolean
          email: string
          id: string
          nome: string
          nucleo_id: string
          pessoa_id: string
          primeiro_acesso: boolean
          tipo_usuario: string
        }[]
      }
      calcular_comissao: {
        Args: { p_categoria_id: string; p_valor_venda: number }
        Returns: {
          faixa_id: string
          faixa_nome: string
          percentual: number
          valor_comissao: number
        }[]
      }
      calcular_complementares_lista_compras: {
        Args: { p_produto_id: string; p_quantidade: number }
        Returns: {
          complemento_descricao: string
          obrigatoriedade: string
          preco_referencia: number
          quantidade_necessaria: number
          unidade: string
          valor_estimado: number
        }[]
      }
      calcular_data_termino_dias_uteis: {
        Args: { data_inicio: string; dias_uteis: number }
        Returns: string
      }
      calcular_preco_item: {
        Args: {
          aplicar_hw?: boolean
          categoria: string
          ci: number
          hora_william_valor?: number
          horas_william?: number
          margem?: number
          percentual_cf_categoria: number
          percentual_cv: number
        }
        Returns: {
          custo_total_sem_margem: number
          percentual_hw: number
          preco_final: number
        }[]
      }
      calcular_preco_venda:
        | {
            Args: { p_custo_aquisicao: number; p_nucleo_nome?: string }
            Returns: number
          }
        | {
            Args: { p_product_id: string }
            Returns: {
              cf: number
              ci: number
              ct: number
              cv: number
              hw: number
              m: number
              preco_venda: number
            }[]
          }
      comparar_periodos: {
        Args: { p_fim: string; p_inicio: string; p_tabela: string }
        Returns: {
          registros_afetados: number
          total_deletes: number
          total_inserts: number
          total_updates: number
        }[]
      }
      configurar_drive_cliente: {
        Args: { p_cliente_id: string; p_drive_link: string }
        Returns: boolean
      }
      confirmar_dados_cliente: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      copiar_checklist_nao_concluido: {
        Args: {
          p_data_destino: string
          p_data_origem: string
          p_usuario_id: string
        }
        Returns: string
      }
      create_contract_from_proposal: {
        Args: { p_overwrite?: boolean; p_proposal_id: string }
        Returns: undefined
      }
      create_parcelas_for_lancamento:
        | {
            Args: {
              p_lancamento_id: string
              p_num: number
              p_user: string
              p_valor: number
            }
            Returns: undefined
          }
        | {
            Args: {
              p_data_competencia: string
              p_descricao: string
              p_lancamento_id: string
              p_nucleo_id: string
              p_num_parcelas: number
              p_user_id: string
              p_valor_total: number
            }
            Returns: undefined
          }
      criar_checklist_de_template: {
        Args: {
          p_nucleo_id: string
          p_template_id: string
          p_titulo: string
          p_vinculo_id: string
          p_vinculo_tipo: string
        }
        Returns: string
      }
      criar_conta_padrao: {
        Args: { p_nucleo: string; p_tipo: string }
        Returns: string
      }
      criar_lancamento_saida: {
        Args: {
          p_categoria_id?: string
          p_contrato_id?: string
          p_descricao: string
          p_nucleo?: string
          p_observacoes?: string
          p_pessoa_id: string
          p_valor: number
          p_vencimento?: string
        }
        Returns: string
      }
      criar_lancamentos_contrato: {
        Args: {
          p_contrato_id: string
          p_dia_vencimento?: number
          p_numero_parcelas?: number
          p_percentual_entrada?: number
        }
        Returns: string
      }
      criar_lancamentos_contrato_v2: {
        Args: {
          p_contrato_id: string
          p_numero_parcelas?: number
          p_percentual_entrada?: number
        }
        Returns: string
      }
      criar_link_cadastro: {
        Args: {
          p_enviado_por?: string
          p_enviado_via?: string
          p_nucleo_id?: string
          p_reutilizavel?: boolean
          p_tipo: string
          p_uso_maximo?: number
        }
        Returns: Json
      }
      criar_mov_virtual_compra: {
        Args: { p_contrato_id: string; p_pedido_id: string; p_valor: number }
        Returns: undefined
      }
      criar_onboarding_arquitetura: {
        Args: { p_cliente_id?: string; p_contrato_id: string }
        Returns: string
      }
      criar_oportunidade_de_solicitacao: {
        Args: {
          p_descricao: string
          p_email: string
          p_empreendimento?: string
          p_especificador_id?: string
          p_especificador_nome?: string
          p_nome: string
          p_origem?: string
          p_telefone: string
        }
        Returns: Json
      }
      criar_ponto_recuperacao: {
        Args: { p_descricao?: string; p_nome: string; p_tipo?: string }
        Returns: string
      }
      criar_projeto_do_contrato: {
        Args: { p_contrato_id: string }
        Returns: string
      }
      criar_proposta_direto: {
        Args: {
          p_cliente_id: string
          p_descricao: string
          p_exibir_valores: boolean
          p_forma_pagamento: string
          p_numero_parcelas: number
          p_oportunidade_id: string
          p_percentual_entrada: number
          p_prazo_execucao_dias: number
          p_status: string
          p_titulo: string
          p_validade_dias: number
          p_valor_mao_obra: number
          p_valor_materiais: number
          p_valor_total: number
        }
        Returns: string
      }
      criar_usuario_admin: {
        Args: {
          p_email: string
          p_pessoa_id: string
          p_senha: string
          p_tipo_usuario?: string
        }
        Returns: Json
      }
      criar_usuario_completo: {
        Args: {
          p_email: string
          p_pessoa_id?: string
          p_senha?: string
          p_tipo_usuario?: string
        }
        Returns: Json
      }
      criar_usuario_por_cpf: {
        Args: { p_cpf: string; p_nucleo_id?: string; p_tipo_usuario?: string }
        Returns: {
          mensagem: string
          senha_temporaria: string
          usuario_id: string
        }[]
      }
      cron_atualizar_contratos_vencidos: { Args: never; Returns: undefined }
      cron_atualizar_parcelas_vencidas: { Args: never; Returns: undefined }
      cron_consolidar_metricas_diarias: { Args: never; Returns: undefined }
      cron_gerar_lembretes_pagamento: { Args: never; Returns: undefined }
      cron_limpar_arquivos_temporarios: { Args: never; Returns: undefined }
      current_empresa_id: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      definir_permissoes_padrao: { Args: never; Returns: undefined }
      estatisticas_link_reutilizavel: {
        Args: { p_token: string }
        Returns: Json
      }
      extrair_numero_parcelas: { Args: { condicoes: string }; Returns: number }
      financeiro_virtual_get_or_create_conta: {
        Args: {
          p_contrato_id: string
          p_entidade_id: string
          p_entidade_tipo: string
          p_nome: string
        }
        Returns: string
      }
      financeiro_virtual_registrar_compra: {
        Args: {
          p_contrato_id: string
          p_descricao: string
          p_entidade_id: string
          p_entidade_tipo: string
          p_origem?: string
          p_percentual_fee?: number
          p_referencia_id?: string
          p_referencia_tipo?: string
          p_valor_compra: number
        }
        Returns: undefined
      }
      fn_atualizar_status_financeiro: {
        Args: { financeiro_id: string }
        Returns: undefined
      }
      fn_convidar_fornecedores_cotacao: {
        Args: { p_cotacao_id: string }
        Returns: number
      }
      fn_get_user_nucleo_id: { Args: never; Returns: string }
      fn_get_user_pessoa_id: { Args: never; Returns: string }
      fn_is_admin_or_master: { Args: never; Returns: boolean }
      fn_obter_usuario_logado: {
        Args: never
        Returns: {
          is_admin: boolean
          nucleo_id: string
          pessoa_id: string
          tipo_usuario: string
          usuario_id: string
        }[]
      }
      fn_resumo_financeiro_colaborador: {
        Args: { p_colaborador_id: string }
        Returns: {
          valor_aprovado: number
          valor_liberado: number
          valor_pago: number
          valor_previsto: number
        }[]
      }
      fn_resumo_financeiro_fornecedor: {
        Args: { p_fornecedor_id: string }
        Returns: {
          total_servicos: number
          valor_contratado: number
          valor_pago: number
          valor_pendente: number
        }[]
      }
      fn_sincronizar_contratos_ativos: {
        Args: never
        Returns: {
          contratos_processados: number
          projetos_criados: number
          tarefas_criadas: number
        }[]
      }
      fn_usuario_auth_match: {
        Args: { p_usuario_id: string }
        Returns: boolean
      }
      fn_usuario_id_atual: { Args: never; Returns: string }
      gerar_alertas_vencimento: { Args: never; Returns: undefined }
      gerar_descricao_lancamento: {
        Args: {
          p_contrato_numero: string
          p_tipo: string
          p_unidade_negocio: string
        }
        Returns: string
      }
      gerar_lancamento_fee_gestao: {
        Args: { p_contrato_id: string; p_nucleo?: string }
        Returns: string
      }
      gerar_link_compartilhamento: {
        Args: {
          p_conta_id?: string
          p_criado_por?: string
          p_destinatario_email?: string
          p_destinatario_nome?: string
          p_destinatario_tipo?: string
          p_empresa_id: string
          p_expira_em?: string
          p_limite_acessos?: number
        }
        Returns: {
          compartilhamento_id: string
          token: string
          url: string
        }[]
      }
      gerar_lista_compras_obra: {
        Args: {
          p_analise_id?: string
          p_proposta_id?: string
          p_titulo?: string
        }
        Returns: string
      }
      gerar_lista_compras_projeto: {
        Args: { p_projeto_id: string }
        Returns: number
      }
      gerar_numero_analise: { Args: { p_cliente_id: string }; Returns: string }
      gerar_numero_contrato:
        | { Args: never; Returns: string }
        | { Args: { cliente_nome: string; nucleo: string }; Returns: string }
      gerar_numero_inventario: {
        Args: { p_nucleo_id: string }
        Returns: string
      }
      gerar_numero_movimentacao: {
        Args: { p_nucleo_id: string; p_tipo: string }
        Returns: string
      }
      gerar_numero_os: { Args: never; Returns: string }
      gerar_numero_pedido_compra: { Args: never; Returns: string }
      gerar_numero_projeto: { Args: never; Returns: string }
      gerar_numero_proposta: { Args: never; Returns: string }
      gerar_numero_quantitativo: { Args: { p_nucleo: string }; Returns: string }
      gerar_parcelas_contrato: {
        Args: { p_contrato_id: string }
        Returns: undefined
      }
      gerar_parcelas_padrao: {
        Args: {
          p_data_inicio: string
          p_financeiro_id: string
          p_valor_total: number
        }
        Returns: undefined
      }
      gerar_senha_automatica: { Args: never; Returns: string }
      gerar_thumbnails_url: {
        Args: { p_bucket: string; p_path: string }
        Returns: Json
      }
      gerar_url_imagem: {
        Args: {
          p_bucket: string
          p_format?: string
          p_height?: number
          p_path: string
          p_quality?: number
          p_width?: number
        }
        Returns: string
      }
      get_categoria_segura: { Args: { p_nome: string }; Returns: string }
      get_complementares_produto: {
        Args: { p_produto_base: string }
        Returns: {
          complemento: string
          preco_referencia: number
          quantidade_por_unidade: number
          tipo: string
          unidade_calculo: string
        }[]
      }
      get_my_permissions: {
        Args: never
        Returns: {
          ativo: boolean
          auth_user_id: string
          pessoa_nome: string
          tipo_usuario: string
          usuario_id: string
        }[]
      }
      get_next_category_seq: {
        Args: { p_categoria_id: string }
        Returns: number
      }
      get_or_create_categoria: {
        Args: { p_nome: string; p_tipo?: string }
        Returns: string
      }
      get_pessoa_segura: { Args: { p_nome: string }; Returns: string }
      get_proposta_primary_nucleo: {
        Args: { proposta_uuid: string }
        Returns: string
      }
      get_total_projeto_compras: {
        Args: { p_projeto_id: string }
        Returns: {
          itens_comprados: number
          itens_pendentes: number
          total_fee: number
          total_geral: number
          total_real: number
          total_virtual: number
        }[]
      }
      get_user_tipo: { Args: { user_auth_id: string }; Returns: string }
      historico_registro: {
        Args: { p_registro_id: string; p_tabela: string }
        Returns: {
          campos_alterados: string[]
          dados_antes: Json
          dados_depois: Json
          operacao: string
          quando: string
          quem: string
        }[]
      }
      indicar_digitando: { Args: { p_canal: string }; Returns: undefined }
      inserir_lancamento_seguro: {
        Args: {
          p_categoria_nome: string
          p_conta_bancaria: string
          p_data_competencia: string
          p_data_pagamento: string
          p_descricao: string
          p_nucleo_nome: string
          p_numero: string
          p_observacoes: string
          p_pessoa_nome: string
          p_status: string
          p_tipo: string
          p_valor: number
        }
        Returns: boolean
      }
      inserir_percentuais_categoria: {
        Args: { p_codigo_categoria: string; p_percentuais: number[] }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_juridico_user: { Args: never; Returns: boolean }
      is_user_admin: { Args: never; Returns: boolean }
      is_user_admin_or_master: { Args: never; Returns: boolean }
      is_user_master: { Args: never; Returns: boolean }
      limpar_audit_antigo: { Args: { p_dias_manter?: number }; Returns: number }
      limpar_typing_antigos: { Args: never; Returns: undefined }
      listar_clientes_sem_drive: {
        Args: never
        Returns: {
          email: string
          id: string
          nome: string
          telefone: string
        }[]
      }
      listar_especificadores_master: {
        Args: { p_nucleo_id?: string }
        Returns: {
          email: string
          id: string
          nome: string
          tipo: string
        }[]
      }
      listar_modulos_permitidos: {
        Args: { p_auth_user_id: string }
        Returns: {
          codigo: string
          nome: string
          path: string
          pode_criar: boolean
          pode_editar: boolean
          pode_excluir: boolean
          pode_exportar: boolean
          pode_importar: boolean
          pode_visualizar: boolean
          secao: string
        }[]
      }
      marcar_usuarios_inativos: { Args: never; Returns: undefined }
      marcar_webhook_enviado: {
        Args: { p_resposta?: Json; p_webhook_id: string }
        Returns: undefined
      }
      marcar_webhook_erro: {
        Args: { p_erro: string; p_webhook_id: string }
        Returns: undefined
      }
      obter_conta_padrao_nucleo: {
        Args: { p_nucleo_id: string }
        Returns: {
          agencia: string
          agencia_digito: string
          banco_codigo: string
          banco_nome: string
          cnpj: string
          conta: string
          conta_digito: string
          pix_chave: string
          pix_tipo: string
          razao_social: string
          tipo_conta: string
        }[]
      }
      parse_brl_money: { Args: { "": string }; Returns: number }
      preencher_cadastro: {
        Args: {
          p_agencia?: string
          p_banco?: string
          p_cargo?: string
          p_cep?: string
          p_cidade?: string
          p_conta?: string
          p_cpf_cnpj?: string
          p_email: string
          p_empresa?: string
          p_endereco?: string
          p_estado?: string
          p_nome: string
          p_observacoes?: string
          p_pix?: string
          p_telefone?: string
          p_tipo_conta?: string
          p_token: string
        }
        Returns: Json
      }
      preparar_webhook_payload: {
        Args: { p_evento: string; p_new: Json; p_old: Json; p_tabela: string }
        Returns: Json
      }
      process_proposal_approval: {
        Args: { p_proposal_id: string; p_user_id: string }
        Returns: Json
      }
      processar_importacao_pricelist: {
        Args: { p_import_log_id: string }
        Returns: {
          erros: number
          sucesso: number
        }[]
      }
      processar_webhooks_pendentes: {
        Args: never
        Returns: {
          evento: string
          payload: Json
          tabela: string
          webhook_id: string
          webhook_url: string
        }[]
      }
      registrar_acesso_cliente:
        | {
            Args: {
              p_cliente_id: string
              p_dispositivo?: string
              p_usuario_id?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_cliente_id: string
              p_dispositivo?: string
              p_usuario_id?: string
            }
            Returns: undefined
          }
      registrar_acesso_compartilhamento: {
        Args: { p_id: string; p_ip?: string }
        Returns: undefined
      }
      registrar_timeline_evento: {
        Args: {
          p_contrato_id?: string
          p_dados?: Json
          p_descricao?: string
          p_nucleo?: string
          p_oportunidade_id: string
          p_origem?: string
          p_tipo?: string
          p_titulo?: string
          p_usuario_id?: string
          p_visivel_cliente?: boolean
        }
        Returns: string
      }
      registrar_ultimo_acesso: { Args: { p_cpf: string }; Returns: undefined }
      registrar_upload_arquivo: {
        Args: {
          p_altura?: number
          p_bucket: string
          p_entidade_id?: string
          p_entidade_tipo?: string
          p_largura?: number
          p_nome_original: string
          p_path: string
          p_tamanho_bytes?: number
          p_temporario?: boolean
          p_tipo_mime?: string
        }
        Returns: string
      }
      rejeitar_cadastro: {
        Args: {
          p_cadastro_id: string
          p_motivo: string
          p_rejeitado_por: string
        }
        Returns: Json
      }
      resetar_senha_usuario: {
        Args: { p_cpf: string }
        Returns: {
          mensagem: string
          nova_senha: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      solicitar_proposta_publica: {
        Args: {
          p_cidade?: string
          p_descricao?: string
          p_email: string
          p_empreendimento?: string
          p_especificador_id?: string
          p_especificador_nome?: string
          p_estado?: string
          p_nome: string
          p_origem?: string
          p_telefone: string
        }
        Returns: Json
      }
      sp_gerar_contratos_por_proposta: {
        Args: { p_proposta_id: string }
        Returns: undefined
      }
      totalizar_lista_compras_projeto: {
        Args: { p_projeto_id: string }
        Returns: {
          conta_real: number
          conta_virtual: number
          total_itens: number
          valor_cliente_direto: number
          valor_fee: number
          valor_total: number
          valor_wg_compra: number
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
      validar_compartilhamento: {
        Args: { p_token: string }
        Returns: {
          compartilhamento_id: string
          mensagem: string
          valido: boolean
        }[]
      }
      verificar_orcamentos_expirados: { Args: never; Returns: number }
      verificar_permissao: {
        Args: {
          p_auth_user_id: string
          p_codigo_modulo: string
          p_tipo_permissao?: string
        }
        Returns: boolean
      }
      verificar_tipo_usuario: { Args: { user_id: string }; Returns: string }
      vincular_analise_proposta: {
        Args: { p_analise_id: string; p_proposta_id: string }
        Returns: boolean
      }
      vincular_auth_user: {
        Args: { p_auth_user_id: string; p_usuario_id: string }
        Returns: Json
      }
    }
    Enums: {
      financeiro_referencia_tipo: "R" | "V"
      obrigatoriedade_complementar_enum:
        | "OBRIGATORIO"
        | "RECOMENDADO"
        | "OPCIONAL"
      status_cotacao: "aberta" | "em_andamento" | "encerrada" | "cancelada"
      status_item_compra_enum:
        | "PENDENTE"
        | "APROVADO"
        | "COMPRADO"
        | "ENTREGUE"
        | "CANCELADO"
      status_item_wg:
        | "em_andamento"
        | "concluido"
        | "aguardando_aprovacao"
        | "em_analise"
        | "atrasado"
      status_proposta_fornecedor:
        | "rascunho"
        | "enviada"
        | "em_analise"
        | "aprovada"
        | "rejeitada"
        | "vencedora"
      status_servico_contratado:
        | "contratado"
        | "em_execucao"
        | "pausado"
        | "concluido"
        | "cancelado"
      status_solicitacao_pagamento:
        | "rascunho"
        | "solicitado"
        | "em_analise"
        | "aprovado"
        | "rejeitado"
        | "pago"
        | "cancelado"
      status_valor_receber:
        | "previsto"
        | "aprovado"
        | "liberado"
        | "pago"
        | "cancelado"
      tipo_acao_auditoria:
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "rejeitar"
        | "enviar"
        | "visualizar"
        | "download"
        | "upload"
        | "login"
        | "logout"
      tipo_compra_enum: "WG_COMPRA" | "CLIENTE_DIRETO"
      tipo_conta_enum: "REAL" | "VIRTUAL"
      tipo_item_wg: "projeto" | "obra" | "orcamento"
      tipo_solicitacao_pagamento:
        | "prestador"
        | "fornecedor"
        | "reembolso"
        | "comissao"
        | "honorario"
        | "outros"
      tipo_valor_receber:
        | "comissao"
        | "honorario"
        | "fee_projeto"
        | "bonus"
        | "repasse"
        | "outros"
      unidade_wg: "Arquitetura" | "Engenharia" | "Marcenaria"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      financeiro_referencia_tipo: ["R", "V"],
      obrigatoriedade_complementar_enum: [
        "OBRIGATORIO",
        "RECOMENDADO",
        "OPCIONAL",
      ],
      status_cotacao: ["aberta", "em_andamento", "encerrada", "cancelada"],
      status_item_compra_enum: [
        "PENDENTE",
        "APROVADO",
        "COMPRADO",
        "ENTREGUE",
        "CANCELADO",
      ],
      status_item_wg: [
        "em_andamento",
        "concluido",
        "aguardando_aprovacao",
        "em_analise",
        "atrasado",
      ],
      status_proposta_fornecedor: [
        "rascunho",
        "enviada",
        "em_analise",
        "aprovada",
        "rejeitada",
        "vencedora",
      ],
      status_servico_contratado: [
        "contratado",
        "em_execucao",
        "pausado",
        "concluido",
        "cancelado",
      ],
      status_solicitacao_pagamento: [
        "rascunho",
        "solicitado",
        "em_analise",
        "aprovado",
        "rejeitado",
        "pago",
        "cancelado",
      ],
      status_valor_receber: [
        "previsto",
        "aprovado",
        "liberado",
        "pago",
        "cancelado",
      ],
      tipo_acao_auditoria: [
        "criar",
        "editar",
        "excluir",
        "aprovar",
        "rejeitar",
        "enviar",
        "visualizar",
        "download",
        "upload",
        "login",
        "logout",
      ],
      tipo_compra_enum: ["WG_COMPRA", "CLIENTE_DIRETO"],
      tipo_conta_enum: ["REAL", "VIRTUAL"],
      tipo_item_wg: ["projeto", "obra", "orcamento"],
      tipo_solicitacao_pagamento: [
        "prestador",
        "fornecedor",
        "reembolso",
        "comissao",
        "honorario",
        "outros",
      ],
      tipo_valor_receber: [
        "comissao",
        "honorario",
        "fee_projeto",
        "bonus",
        "repasse",
        "outros",
      ],
      unidade_wg: ["Arquitetura", "Engenharia", "Marcenaria"],
    },
  },
} as const
