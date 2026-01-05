import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { ESTAGIOS, NUCLEOS, CORES_NUCLEOS, type Nucleo } from "@/constants/oportunidades";
import { formatarMoeda, desformatarMoeda } from "@/utils/formatadores";
import { DateInputBR } from "@/components/ui/DateInputBR";

export default function OportunidadeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<any[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    cliente_id: "",
    valor_estimado: "",
    estagio: "Lead",
    origem: "",
    observacoes: "",
    previsao_fechamento: "",
    // Regras de Obras
    condominio_nome: "",
    condominio_contato: "",
    obra_seg_sex_entrada: "",
    obra_seg_sex_saida: "",
    obra_sab_entrada: "",
    obra_sab_saida: "",
    obra_regras_obs: "",
  });

  const [nucleosSelecionados, setNucleosSelecionados] = useState<string[]>([]);
  const [valoresNucleos, setValoresNucleos] = useState<Record<string, string>>(
    {}
  );

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("tipo", "CLIENTE")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (!error) setClientes(data || []);
  }

  async function carregarOportunidade() {
    if (!id) return;

    const { data, error } = await supabase
      .from("oportunidades")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return;

    setForm({
      titulo: data.titulo ?? "",
      cliente_id: data.cliente_id ?? "",
      valor_estimado: data.valor ?? "",
      estagio: data.estagio ?? "Lead",
      origem: data.origem ?? "",
      observacoes: data.observacoes ?? "",
      previsao_fechamento: data.data_fechamento_prevista
        ? data.data_fechamento_prevista.split("T")[0]
        : "",
      // Regras de Obras
      condominio_nome: data.condominio_nome ?? "",
      condominio_contato: data.condominio_contato ?? "",
      obra_seg_sex_entrada: data.obra_seg_sex_entrada ?? "",
      obra_seg_sex_saida: data.obra_seg_sex_saida ?? "",
      obra_sab_entrada: data.obra_sab_entrada ?? "",
      obra_sab_saida: data.obra_sab_saida ?? "",
      obra_regras_obs: data.obra_regras_obs ?? "",
    });

    // Carregar núcleos
    const { data: nucleos } = await supabase
      .from("oportunidades_nucleos")
      .select("*")
      .eq("oportunidade_id", id);

    if (nucleos && nucleos.length > 0) {
      setNucleosSelecionados(nucleos.map((n: any) => n.nucleo));
      const map: Record<string, string> = {};
      nucleos.forEach((n: any) => {
        map[n.nucleo] = n.valor ? String(n.valor) : "";
      });
      setValoresNucleos(map);
    }
  }

  useEffect(() => {
    carregarClientes();
    carregarOportunidade();
  }, []);

  function alterar(campo: string, valor: any) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function toggleNucleo(n: string) {
    setNucleosSelecionados((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  // Calcular valor estimado automaticamente como soma dos núcleos
  const valorEstimadoCalculado = useMemo(() => {
    const soma = nucleosSelecionados.reduce((total, nucleo) => {
      const valor = valoresNucleos[nucleo];
      return total + (valor ? Number(valor) : 0);
    }, 0);
    return soma;
  }, [nucleosSelecionados, valoresNucleos]);

  async function salvar() {
    if (!form.titulo.trim() || !form.cliente_id) {
      alert("Título e Cliente são obrigatórios.");
      return;
    }

    // Montar payload apenas com campos válidos da tabela
    const payload = {
      titulo: form.titulo.trim(),
      cliente_id: form.cliente_id,
      valor: valorEstimadoCalculado || null,
      estagio: form.estagio,
      origem: form.origem || null,
      observacoes: form.observacoes || null,
      data_fechamento_prevista: form.previsao_fechamento || null,
      // Regras de Obras
      condominio_nome: form.condominio_nome || null,
      condominio_contato: form.condominio_contato || null,
      obra_seg_sex_entrada: form.obra_seg_sex_entrada || null,
      obra_seg_sex_saida: form.obra_seg_sex_saida || null,
      obra_sab_entrada: form.obra_sab_entrada || null,
      obra_sab_saida: form.obra_sab_saida || null,
      obra_regras_obs: form.obra_regras_obs || null,
    };

    let oportunidadeId = id || "";

    if (id) {
      const { error } = await supabase
        .from("oportunidades")
        .update(payload)
        .eq("id", id);

      if (error) {
        alert("Erro ao atualizar oportunidade: " + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("oportunidades")
        .insert(payload)
        .select("id")
        .single();

      if (error || !data) {
        alert("Erro ao criar oportunidade: " + error?.message);
        return;
      }
      oportunidadeId = data.id;
    }

    // Salvar unidades (núcleos)
    if (oportunidadeId) {
      await supabase
        .from("oportunidades_nucleos")
        .delete()
        .eq("oportunidade_id", oportunidadeId);

      for (const nucleo of nucleosSelecionados) {
        await supabase.from("oportunidades_nucleos").insert({
          oportunidade_id: oportunidadeId,
          nucleo,
          valor: valoresNucleos[nucleo]
            ? Number(valoresNucleos[nucleo])
            : null,
        });
      }

      // NOTA: Cards só são copiados para os Kanbans dos núcleos quando
      // a oportunidade chega ao estágio "Fechamento" no Kanban principal.
      // Até lá, são apenas clientes em potencial.
    }

    alert("Oportunidade salva com sucesso!");
    navigate("/oportunidades");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        {id ? "Editar Oportunidade" : "Nova Oportunidade"}
      </h1>

      {/* Campos principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Título *
          </label>
          <input
            className="w-full p-2 border rounded border-[#D9D9D9]"
            value={form.titulo}
            onChange={(e) => alterar("titulo", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Cliente *
          </label>
          <select
            className="w-full p-2 border rounded border-[#D9D9D9]"
            value={form.cliente_id}
            onChange={(e) => alterar("cliente_id", e.target.value)}
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Valor Estimado (Total) - Calculado automaticamente
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded border-[#D9D9D9] bg-gray-50"
            value={formatarMoeda(valorEstimadoCalculado)}
            readOnly
            title="Este valor é calculado automaticamente pela soma dos núcleos"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Estágio
          </label>
          <select
            className="w-full p-2 border rounded border-[#D9D9D9]"
            value={form.estagio}
            onChange={(e) => alterar("estagio", e.target.value)}
          >
            {ESTAGIOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Origem
          </label>
          <input
            className="w-full p-2 border rounded border-[#D9D9D9]"
            value={form.origem}
            onChange={(e) => alterar("origem", e.target.value)}
            placeholder="Indicação, Instagram, Google..."
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2E2E2E] font-medium">
            📅 Previsão de Fechamento
          </label>
          <DateInputBR
            value={form.previsao_fechamento}
            onChange={(val) => alterar("previsao_fechamento", val)}
            title="Selecione a data prevista para fechar este negócio"
            className="w-full p-2.5 border rounded-lg border-[#D9D9D9] focus:border-[#2B4580] focus:ring-2 focus:ring-[#2B4580]/20 transition-all"
          />
          {form.previsao_fechamento && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(form.previsao_fechamento + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>

      {/* Unidades (Núcleos) WG */}
      <div className="mt-6">
        <label className="block text-sm mb-2 font-medium text-[#1A1A1A]">
          Unidades do Grupo WG envolvidas
        </label>

        <div className="grid grid-cols-3 gap-4">
          {NUCLEOS.map((n) => {
            const selected = nucleosSelecionados.includes(n);
            const cores = CORES_NUCLEOS[n as Nucleo];
            return (
              <div key={n} className="flex flex-col gap-2">
                {/* Botão do Núcleo */}
                <button
                  type="button"
                  onClick={() => toggleNucleo(n)}
                  className="p-3 text-sm font-semibold rounded-xl border-2 transition-all"
                  style={
                    selected
                      ? {
                          backgroundColor: cores.primary,
                          borderColor: cores.border,
                          color: "white",
                        }
                      : {
                          backgroundColor: cores.secondary,
                          borderColor: cores.border,
                          color: cores.text,
                        }
                  }
                >
                  {n}
                </button>

                {/* Input de Valor aparece diretamente abaixo quando selecionado */}
                {selected && (
                  <input
                    type="number"
                    className="p-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      borderColor: cores.border,
                      backgroundColor: cores.secondary,
                    }}
                    value={valoresNucleos[n] || ""}
                    onChange={(e) =>
                      setValoresNucleos((prev) => ({
                        ...prev,
                        [n]: e.target.value,
                      }))
                    }
                    placeholder="R$ 0,00"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regras de Obras */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-[#2E2E2E] mb-4 flex items-center gap-2">
          🏗️ Regras de Obras do Condomínio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-[#2E2E2E]">
              Nome do Condomínio
            </label>
            <input
              className="w-full p-2 border rounded border-[#D9D9D9]"
              value={form.condominio_nome}
              onChange={(e) => alterar("condominio_nome", e.target.value)}
              placeholder="Ex: Condomínio Residencial..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#2E2E2E]">
              Contato do Condomínio
            </label>
            <input
              className="w-full p-2 border rounded border-[#D9D9D9]"
              value={form.condominio_contato}
              onChange={(e) => alterar("condominio_contato", e.target.value)}
              placeholder="Telefone, síndico, portaria..."
            />
          </div>
        </div>

        {/* Horários de Obra */}
        <div className="mt-4">
          <label className="block text-sm mb-2 text-[#2E2E2E] font-medium">
            Horários Permitidos para Obras
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Segunda a Sexta */}
            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-xs font-medium text-gray-600 mb-2 block">
                Segunda a Sexta
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Entrada</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded border-[#D9D9D9]"
                    value={form.obra_seg_sex_entrada}
                    onChange={(e) => alterar("obra_seg_sex_entrada", e.target.value)}
                  />
                </div>
                <span className="text-gray-400 mt-4">às</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Saída</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded border-[#D9D9D9]"
                    value={form.obra_seg_sex_saida}
                    onChange={(e) => alterar("obra_seg_sex_saida", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sábados */}
            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-xs font-medium text-gray-600 mb-2 block">
                Sábados
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Entrada</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded border-[#D9D9D9]"
                    value={form.obra_sab_entrada}
                    onChange={(e) => alterar("obra_sab_entrada", e.target.value)}
                  />
                </div>
                <span className="text-gray-400 mt-4">às</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Saída</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded border-[#D9D9D9]"
                    value={form.obra_sab_saida}
                    onChange={(e) => alterar("obra_sab_saida", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observações das Regras */}
        <div className="mt-4">
          <label className="block text-sm mb-1 text-[#2E2E2E]">
            Observações sobre as Regras
          </label>
          <textarea
            className="w-full p-2 border rounded border-[#D9D9D9]"
            rows={3}
            value={form.obra_regras_obs}
            onChange={(e) => alterar("obra_regras_obs", e.target.value)}
            placeholder="Restrições especiais, regras adicionais, normas do condomínio..."
          />
        </div>
      </div>

      {/* Observações */}
      <div className="mt-6">
        <label className="block text-sm mb-1 text-[#2E2E2E]">
          Observações Gerais
        </label>
        <textarea
          className="w-full p-2 border rounded border-[#D9D9D9]"
          rows={4}
          value={form.observacoes}
          onChange={(e) => alterar("observacoes", e.target.value)}
          placeholder="Anotações, detalhes do cliente, informações relevantes..."
        />
      </div>

      <div className="mt-6 flex justify-between">
        <button
          className="px-4 py-2 bg-[#F3F3F3] text-[#2E2E2E] rounded hover:bg-[#E5E5E5]"
          onClick={() => navigate("/oportunidades")}
        >
          Voltar
        </button>
        <button
          className="px-4 py-2 bg-[#F25C26] text-white rounded hover:bg-[#D94E1F] transition-colors"
          onClick={salvar}
        >
          Salvar Oportunidade
        </button>
      </div>
    </div>
  );
}
