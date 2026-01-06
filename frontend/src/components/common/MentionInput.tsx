// ============================================================
// COMPONENTE: Input com Autocomplete de Menções @
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Componente reutilizável para input de texto com menções de usuários
// Uso: <MentionInput value={texto} onChange={setTexto} />
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

// ============================================================
// TIPOS
// ============================================================

interface Usuario {
  id: string;
  nome: string;
  email?: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: () => void; // Ctrl+Enter para enviar
}

interface MentionSuggestion {
  id: string;
  nome: string;
  email?: string;
  avatar_url?: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function MentionInput({
  value,
  onChange,
  placeholder = "Digite sua mensagem... Use @ para mencionar alguém",
  rows = 3,
  disabled = false,
  className = "",
  autoFocus = false,
  onSubmit,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cache de usuários para evitar múltiplas requisições
  const [usuariosCache, setUsuariosCache] = useState<Usuario[]>([]);

  // Carregar usuários do sistema (colaboradores e admins)
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select(`
            id,
            pessoa:pessoas!usuarios_pessoa_id_fkey (
              nome,
              email,
              avatar_url
            )
          `)
          .eq("ativo", true)
          .limit(100);

        if (error) throw error;

        const usuarios = (data || []).map((u: any) => ({
          id: u.id,
          nome: u.pessoa?.nome || "Usuário",
          email: u.pessoa?.email,
          avatar_url: u.pessoa?.avatar_url,
        }));

        setUsuariosCache(usuarios);
      } catch (err) {
        console.error("Erro ao carregar usuários para menções:", err);
      }
    }

    carregarUsuarios();
  }, []);

  // Detectar quando o usuário digita @
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;

      onChange(newValue);
      setCursorPosition(cursorPos);

      // Verificar se estamos em um contexto de menção
      const textBeforeCursor = newValue.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        // Verificar se o @ não está dentro de um @[...] já existente
        const textAfterAt = textBeforeCursor.substring(lastAtIndex);
        const hasClosingBracket = textAfterAt.includes("]");

        if (!hasClosingBracket) {
          // Extrair termo de busca após o @
          const searchText = textBeforeCursor.substring(lastAtIndex + 1);

          // Verificar se não há espaço antes do @ (início de palavra)
          const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
          const isValidMention = charBeforeAt === " " || charBeforeAt === "\n" || lastAtIndex === 0;

          if (isValidMention && !searchText.includes(" ") && !searchText.includes("\n")) {
            setMentionStart(lastAtIndex);
            setSearchTerm(searchText);
            setShowSuggestions(true);
            setSelectedIndex(0);

            // Filtrar sugestões
            const filtered = usuariosCache.filter(
              (u) =>
                u.nome.toLowerCase().includes(searchText.toLowerCase()) ||
                (u.email && u.email.toLowerCase().includes(searchText.toLowerCase()))
            );
            setSuggestions(filtered.slice(0, 8));
            return;
          }
        }
      }

      // Fechar sugestões se não estiver em contexto de menção
      setShowSuggestions(false);
      setMentionStart(null);
    },
    [onChange, usuariosCache]
  );

  // Inserir menção selecionada
  const insertMention = useCallback(
    (usuario: MentionSuggestion) => {
      if (mentionStart === null) return;

      const beforeMention = value.substring(0, mentionStart);
      const afterMention = value.substring(cursorPosition);

      // Formato: @[usuario_id] com display @Nome
      const mentionText = `@[${usuario.id}]`;
      const newValue = beforeMention + mentionText + " " + afterMention;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionStart(null);

      // Focar no textarea e posicionar cursor após a menção
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = mentionStart + mentionText.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [value, mentionStart, cursorPosition, onChange]
  );

  // Navegação por teclado nas sugestões
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter para enviar
      if (e.ctrlKey && e.key === "Enter" && onSubmit) {
        e.preventDefault();
        onSubmit();
        return;
      }

      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case "Enter":
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          break;
        case "Tab":
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          break;
      }
    },
    [showSuggestions, suggestions, selectedIndex, insertMention, onSubmit]
  );

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Renderizar texto com menções destacadas
  const renderPreview = () => {
    if (!value) return null;

    // Substituir @[id] por @Nome
    let displayText = value;
    const mentionRegex = /@\[([^\]]+)\]/g;
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      const userId = match[1];
      const usuario = usuariosCache.find((u) => u.id === userId);
      if (usuario) {
        displayText = displayText.replace(match[0], `@${usuario.nome}`);
      }
    }

    return displayText;
  };

  return (
    <div className="relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />

      {/* Preview de menções (opcional - pode ser habilitado) */}
      {/* {value && (
        <div className="mt-1 text-xs text-gray-500">
          Preview: {renderPreview()}
        </div>
      )} */}

      {/* Dropdown de sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
            Mencionar usuário
          </div>
          {suggestions.map((usuario, index) => (
            <button
              key={usuario.id}
              type="button"
              onClick={() => insertMention(usuario)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? "bg-orange-50 border-l-2 border-[#F25C26]" : ""
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden flex-shrink-0">
                {usuario.avatar_url ? (
                  <img
                    src={usuario.avatar_url}
                    alt={usuario.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  usuario.nome.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {usuario.nome}
                </p>
                {usuario.email && (
                  <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                )}
              </div>
            </button>
          ))}

          {/* Dica de navegação */}
          <div className="px-3 py-2 text-[10px] text-gray-400 border-t bg-gray-50 flex items-center gap-2">
            <span className="px-1 py-0.5 bg-gray-200 rounded text-gray-600">↑↓</span>
            navegar
            <span className="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Enter</span>
            selecionar
            <span className="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Esc</span>
            fechar
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#F25C26] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// UTILITÁRIOS EXPORTADOS
// ============================================================

/**
 * Extrair IDs de usuários mencionados de um texto
 */
export function extrairMencoesDoTexto(texto: string): string[] {
  const regex = /@\[([^\]]+)\]/g;
  const mencoes: string[] = [];
  let match;

  while ((match = regex.exec(texto)) !== null) {
    mencoes.push(match[1]);
  }

  return [...new Set(mencoes)];
}

/**
 * Formatar texto substituindo @[id] por @Nome para exibição
 */
export function formatarTextoComMencoes(
  texto: string,
  usuarios: Array<{ id: string; nome: string }>
): string {
  let resultado = texto;

  usuarios.forEach((u) => {
    const regex = new RegExp(`@\\[${u.id}\\]`, "g");
    resultado = resultado.replace(regex, `@${u.nome}`);
  });

  return resultado;
}

/**
 * Renderizar texto com menções como elementos clicáveis
 */
export function renderizarMencoesComoLinks(
  texto: string,
  usuarios: Array<{ id: string; nome: string }>,
  onMentionClick?: (userId: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /@\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    // Texto antes da menção
    if (match.index > lastIndex) {
      parts.push(texto.substring(lastIndex, match.index));
    }

    // Menção
    const userId = match[1];
    const usuario = usuarios.find((u) => u.id === userId);

    if (usuario) {
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium cursor-pointer hover:bg-blue-200 transition-colors"
          onClick={() => onMentionClick?.(userId)}
        >
          @{usuario.nome}
        </span>
      );
    } else {
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
        >
          @usuário
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Texto restante
  if (lastIndex < texto.length) {
    parts.push(texto.substring(lastIndex));
  }

  return parts;
}
