// src/pages/cadastro-publico/CadastroPublicoPage.tsx
// Página pública para preenchimento de cadastro via link
// Otimizada para celular com busca automática de CEP e CNPJ

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import IntroVideoWGAlmeida from "@/components/cadastro-publico/IntroVideoWGAlmeida";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Search,
  Landmark,
  CreditCard,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  buscarCadastroPorToken,
  preencherCadastro,
  CadastroPendente,
  getLabelTipoCadastro,
  DadosCadastroPublico,
} from "@/lib/cadastroLinkApi";
import { PhoneInputInternacional } from "@/components/ui/PhoneInputInternacional";

// Estados brasileiros
const ESTADOS = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

// Cores da marca
const WG_COLORS = {
  laranja: "#F25C26",
  preto: "#2E2E2E",
  cinza: "#4C4C4C",
  cinzaClaro: "#F3F3F3",
  branco: "#FFFFFF",
  arquitetura: "#5E9B94",
  engenharia: "#2B4580",
};

type PageStatus = "loading" | "not_found" | "expired" | "already_filled" | "form" | "success" | "error";

export default function CadastroPublicoPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  // Estado para controlar exibição da intro (skip=1 na URL pula a intro)
  const skipIntro = searchParams.get("skip") === "1";
  const [showIntro, setShowIntro] = useState(!skipIntro);

  // Detectar orientação para vídeo responsivo
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768 || window.innerHeight > window.innerWidth);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const videoSrc = isMobile ? "/videos/hero/VERTICAL.mp4" : "/videos/hero/HORIZONTAL.mp4";

  const [status, setStatus] = useState<PageStatus>("loading");
  const [cadastro, setCadastro] = useState<CadastroPendente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados de busca
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  // Form data
  const [formData, setFormData] = useState<DadosCadastroPublico>({
    nome: "",
    email: "",
    telefone: "",
    cpf_cnpj: "",
    empresa: "",
    cargo: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
    // Dados bancários
    banco: "",
    agencia: "",
    conta: "",
    tipo_conta: "",
    pix: "",
  });

  // Carregar dados do cadastro
  useEffect(() => {
    async function loadCadastro() {
      if (!token) {
        setStatus("not_found");
        return;
      }

      const data = await buscarCadastroPorToken(token);

      if (!data) {
        setStatus("not_found");
        return;
      }

      // Verificar se expirou
      if (new Date(data.expira_em) < new Date()) {
        setStatus("expired");
        return;
      }

      // Verificar se já foi preenchido
      // Links reutilizáveis sempre permitem novos cadastros (desde que não atinjam o limite)
      if (data.status !== "aguardando_preenchimento" && !data.reutilizavel) {
        setStatus("already_filled");
        return;
      }

      // Para links reutilizáveis, verificar se atingiu o limite de usos
      if (data.reutilizavel && data.uso_maximo && data.total_usos && data.total_usos >= data.uso_maximo) {
        setStatus("already_filled");
        return;
      }

      setCadastro(data);
      setStatus("form");
    }

    loadCadastro();
  }, [token]);

  // Formatar CPF/CNPJ
  function formatCpfCnpj(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }


  // Formatar CEP
  function formatCep(value: string): string {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  // Buscar CEP automaticamente (ViaCEP)
  async function buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  }

  // Buscar CNPJ automaticamente (BrasilAPI)
  async function buscarCnpj(cnpj: string) {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;

    setBuscandoCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      const data = await response.json();

      if (!data.message) {
        setFormData((prev) => ({
          ...prev,
          empresa: data.razao_social || data.nome_fantasia || prev.empresa,
          endereco: data.logradouro ? `${data.logradouro}, ${data.numero}` : prev.endereco,
          cidade: data.municipio || prev.cidade,
          estado: data.uf || prev.estado,
          cep: data.cep ? formatCep(data.cep) : prev.cep,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
    } finally {
      setBuscandoCnpj(false);
    }
  }

  // Handler de mudança
  function handleChange(field: keyof DadosCadastroPublico, value: string) {
    let formattedValue = value;

    if (field === "cpf_cnpj") {
      formattedValue = formatCpfCnpj(value);
      // Se for CNPJ (14 dígitos), buscar automaticamente
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 14) {
        buscarCnpj(numbers);
      }
    } else if (field === "cep") {
      formattedValue = formatCep(value);
      // Buscar CEP automaticamente quando completo
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 8) {
        buscarCep(numbers);
      }
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
  }

  // Enviar formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Validações
      if (!formData.nome.trim()) {
        throw new Error("Por favor, informe seu nome completo");
      }
      if (!formData.email.trim()) {
        throw new Error("Por favor, informe seu email");
      }

      const result = await preencherCadastro(token!, formData);

      if (result.success) {
        setStatus("success");
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao enviar cadastro");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Renderizar conteúdo baseado no status
  function renderContent() {
    switch (status) {
      case "loading":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: WG_COLORS.laranja }} />
            <p className="text-gray-500 text-sm">Carregando...</p>
          </motion.div>
        );

      case "not_found":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link Inválido</h2>
            <p className="text-gray-500 text-sm mb-6">
              Este link de cadastro não existe ou já foi utilizado.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "https://www.wgalmeida.com.br"}
                style={{ background: WG_COLORS.laranja }}
                className="w-full"
              >
                Visitar Nosso Site
              </Button>
              <Button
                onClick={() => window.location.href = "https://www.instagram.com/grupowgalmeida/"}
                variant="outline"
                className="w-full"
                style={{ borderColor: WG_COLORS.laranja, color: WG_COLORS.laranja }}
              >
                Seguir no Instagram
              </Button>
            </div>
          </motion.div>
        );

      case "expired":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Clock className="w-14 h-14 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Link Expirado</h2>
            <p className="text-gray-500 text-sm mb-6">
              Este link expirou. Solicite um novo link.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "https://www.wgalmeida.com.br"}
                style={{ background: WG_COLORS.laranja }}
                className="w-full"
              >
                Visitar Nosso Site
              </Button>
              <Button
                onClick={() => window.location.href = "https://www.instagram.com/grupowgalmeida/"}
                variant="outline"
                className="w-full"
                style={{ borderColor: WG_COLORS.laranja, color: WG_COLORS.laranja }}
              >
                Seguir no Instagram
              </Button>
            </div>
          </motion.div>
        );

      case "already_filled":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <AlertTriangle className="w-14 h-14 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Já Preenchido</h2>
            <p className="text-gray-500 text-sm mb-6">
              Este formulário já foi preenchido. Aguarde a aprovação.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "https://www.wgalmeida.com.br"}
                style={{ background: WG_COLORS.laranja }}
                className="w-full"
              >
                Visitar Nosso Site
              </Button>
              <Button
                onClick={() => window.location.href = "https://www.instagram.com/grupowgalmeida/"}
                variant="outline"
                className="w-full"
                style={{ borderColor: WG_COLORS.laranja, color: WG_COLORS.laranja }}
              >
                Seguir no Instagram
              </Button>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Cadastro Enviado!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Aguardando aprovação. Você receberá um email com suas credenciais.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left mb-6">
              <p className="text-green-800 text-xs">
                <strong>Próximos passos:</strong><br />
                1. Nossa equipe analisará seu cadastro<br />
                2. Você receberá um email de confirmação<br />
                3. Use as credenciais para acessar o sistema
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = "https://www.wgalmeida.com.br"}
                style={{ background: WG_COLORS.laranja }}
                className="w-full"
              >
                Conheça Nosso Site
              </Button>
              <Button
                onClick={() => window.location.href = "https://www.instagram.com/grupowgalmeida/"}
                variant="outline"
                className="w-full"
                style={{ borderColor: WG_COLORS.laranja, color: WG_COLORS.laranja }}
              >
                Siga-nos no Instagram
              </Button>
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
            <Button
              onClick={() => setStatus("form")}
              style={{ background: WG_COLORS.laranja }}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </motion.div>
        );

      case "form":
        // Determinar título: personalizado ou padrão baseado no tipo
        const tituloPagina = cadastro?.titulo_pagina ||
          `Cadastro de ${cadastro ? getLabelTipoCadastro(cadastro.tipo_solicitado) : ""}`;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header compacto para mobile */}
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3"
                style={{ background: `${WG_COLORS.laranja}15`, color: WG_COLORS.laranja }}
              >
                {cadastro && getLabelTipoCadastro(cadastro.tipo_solicitado)}
              </div>
              <h1 className="text-xl font-bold text-gray-800">{tituloPagina}</h1>
            </div>

            {/* Form otimizado para mobile */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Dados Pessoais */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: WG_COLORS.laranja }} />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  {/* Nome */}
                  <div>
                    <Label htmlFor="nome" className="text-xs">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-xs">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  {/* Telefone - Com seleção de país */}
                  <div>
                    <Label htmlFor="telefone" className="text-xs">WhatsApp</Label>
                    <PhoneInputInternacional
                      value={formData.telefone}
                      onChange={(value) => setFormData((prev) => ({ ...prev, telefone: value || "" }))}
                      placeholder="Telefone com DDD"
                      defaultCountry="BR"
                      className="h-11"
                    />
                  </div>

                  {/* CPF/CNPJ com busca automática */}
                  <div>
                    <Label htmlFor="cpf_cnpj" className="text-xs">
                      CPF ou CNPJ
                      {buscandoCnpj && <span className="ml-2 text-orange-500">(Buscando...)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={(e) => handleChange("cpf_cnpj", e.target.value)}
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                        className="h-11 pr-10"
                        maxLength={18}
                        inputMode="numeric"
                      />
                      {buscandoCnpj && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      💡 CNPJ preenche empresa automaticamente
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Profissionais */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-4 h-4" style={{ color: WG_COLORS.engenharia }} />
                    Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  {/* Empresa */}
                  <div>
                    <Label htmlFor="empresa" className="text-xs">Empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="empresa"
                        value={formData.empresa}
                        onChange={(e) => handleChange("empresa", e.target.value)}
                        placeholder="Nome da empresa"
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  {/* Cargo */}
                  <div>
                    <Label htmlFor="cargo" className="text-xs">Cargo/Função</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleChange("cargo", e.target.value)}
                      placeholder="Seu cargo"
                      className="h-11"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Endereço com busca de CEP */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: WG_COLORS.arquitetura }} />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  {/* CEP com busca automática */}
                  <div>
                    <Label htmlFor="cep" className="text-xs">
                      CEP
                      {buscandoCep && <span className="ml-2 text-orange-500">(Buscando...)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleChange("cep", e.target.value)}
                        placeholder="00000-000"
                        className="h-11 pr-10"
                        maxLength={9}
                        inputMode="numeric"
                      />
                      {buscandoCep && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      💡 CEP preenche endereço automaticamente
                    </p>
                  </div>

                  {/* Endereço */}
                  <div>
                    <Label htmlFor="endereco" className="text-xs">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange("endereco", e.target.value)}
                      placeholder="Rua, número, complemento"
                      className="h-11"
                    />
                  </div>

                  {/* Cidade e Estado em linha */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cidade" className="text-xs">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                        placeholder="Cidade"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado" className="text-xs">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => handleChange("estado", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado.uf} value={estado.uf}>
                              {estado.uf} - {estado.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados Bancários - Para COLABORADOR, FORNECEDOR e ESPECIFICADOR (não para CLIENTE) */}
              {cadastro?.tipo_solicitado !== "CLIENTE" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Landmark className="w-4 h-4" style={{ color: WG_COLORS.engenharia }} />
                      Dados Bancários
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Para recebimento de pagamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {/* Banco */}
                    <div>
                      <Label htmlFor="banco" className="text-xs">Banco</Label>
                      <Input
                        id="banco"
                        value={formData.banco}
                        onChange={(e) => handleChange("banco", e.target.value)}
                        placeholder="Ex: Bradesco, Itaú, Nubank..."
                        className="h-11"
                      />
                    </div>

                    {/* Agência e Conta em linha */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="agencia" className="text-xs">Agência</Label>
                        <Input
                          id="agencia"
                          value={formData.agencia}
                          onChange={(e) => handleChange("agencia", e.target.value)}
                          placeholder="0000"
                          className="h-11"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conta" className="text-xs">Conta</Label>
                        <Input
                          id="conta"
                          value={formData.conta}
                          onChange={(e) => handleChange("conta", e.target.value)}
                          placeholder="00000-0"
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Tipo de Conta */}
                    <div>
                      <Label htmlFor="tipo_conta" className="text-xs">Tipo de Conta</Label>
                      <Select
                        value={formData.tipo_conta}
                        onValueChange={(value) => handleChange("tipo_conta", value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrente">Conta Corrente</SelectItem>
                          <SelectItem value="poupanca">Conta Poupança</SelectItem>
                          <SelectItem value="salario">Conta Salário</SelectItem>
                          <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* PIX */}
                    <div>
                      <Label htmlFor="pix" className="text-xs flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        Chave PIX
                      </Label>
                      <Input
                        id="pix"
                        value={formData.pix}
                        onChange={(e) => handleChange("pix", e.target.value)}
                        placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                        className="h-11"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observações (colapsável) */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: WG_COLORS.cinza }} />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => handleChange("observacoes", e.target.value)}
                    placeholder="Alguma informação adicional..."
                    rows={3}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Botão Enviar - fixo no mobile */}
              <div className="sticky bottom-0 bg-white pt-3 pb-2 -mx-4 px-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold"
                  style={{ background: WG_COLORS.laranja }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Cadastro"
                  )}
                </Button>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  Ao enviar, você concorda com nossos termos de uso
                </p>
              </div>
            </form>
          </motion.div>
        );
    }
  }

  return (
    <>
      {/* Intro Video - exibida antes do formulário */}
      {showIntro && (
        <IntroVideoWGAlmeida
          onComplete={() => setShowIntro(false)}
          duration={20}
        />
      )}

      {/* Página de Cadastro */}
      {!showIntro && (
        <div className="min-h-screen relative overflow-hidden">
          {/* Vídeo de Fundo */}
          <video
            key={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Overlay escuro para legibilidade */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)",
              zIndex: 1,
            }}
          />

          {/* Conteúdo */}
          <div
            className="relative min-h-screen py-4 px-3 sm:py-8 sm:px-4"
            style={{ zIndex: 2 }}
          >
            <div className="max-w-lg mx-auto">
              {/* Logo menor para mobile */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 sm:mb-6"
              >
                <img
                  src="/imagens/logogrupoWgAlmeida.png"
                  alt="Grupo WG Almeida"
                  className="h-12 sm:h-16 mx-auto drop-shadow-lg"
                />
              </motion.div>

              {/* Content Card com transparência */}
              <Card className="shadow-2xl border-0 backdrop-blur-md" style={{ background: "rgba(255,255,255,0.95)" }}>
                <CardContent className="p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {renderContent()}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[10px] text-white/70 mt-4 drop-shadow"
              >
                © 2025 Grupo WG Almeida
              </motion.p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
