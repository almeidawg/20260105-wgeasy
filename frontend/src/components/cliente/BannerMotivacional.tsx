// ============================================================
// COMPONENTE: BannerMotivacional
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Banner com frase motivacional no topo da área do cliente
// ============================================================

import { useEffect, useState } from "react";
import { Sparkles, Quote } from "lucide-react";

interface BannerMotivacionalProps {
  className?: string;
}

// Frases motivacionais para rotação
const FRASES = [
  "Tudo que acontece você acompanha por aqui, \"uma frase para demonstrar o profissionalismo\"",
  "Transformando sonhos em realidade, um projeto de cada vez",
  "Seu projeto, nossa paixão. Acompanhe cada detalhe aqui",
  "Construindo o futuro com excelência e dedicação",
  "Cada etapa do seu sonho, acompanhada com transparência",
];

export default function BannerMotivacional({ className = "" }: BannerMotivacionalProps) {
  const [fraseAtual, setFraseAtual] = useState(0);

  // Rotação de frases (opcional - descomente se quiser)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setFraseAtual((prev) => (prev + 1) % FRASES.length);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className={`bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white py-4 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm md:text-base font-light italic tracking-wide">
          <span className="text-[#F25C26]">"</span>
          {FRASES[fraseAtual]}
          <span className="text-[#F25C26]">"</span>
        </p>
      </div>
    </div>
  );
}
