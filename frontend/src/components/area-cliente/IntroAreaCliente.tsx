// ============================================================
// COMPONENTE: Intro Area Cliente - Apresentacao Inicial
// Sistema WG Easy - Grupo WG Almeida
// Apresentacao animada das funcionalidades da Area do Cliente
// ============================================================

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SkipForward,
  Camera,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Shield,
  Headphones,
  FolderOpen
} from "lucide-react";

// Cores da marca WG Almeida
const WG_COLORS = {
  laranja: "#F25C26",
  preto: "#2E2E2E",
  cinza: "#4C4C4C",
  cinzaClaro: "#F3F3F3",
  branco: "#FFFFFF",
  arquitetura: "#5E9B94",
  engenharia: "#2B4580",
  marcenaria: "#8B5E3C",
};

// Array de cores da marca para as particulas
const BRAND_COLORS = [
  WG_COLORS.laranja,
  WG_COLORS.arquitetura,
  WG_COLORS.engenharia,
  WG_COLORS.marcenaria,
  WG_COLORS.preto,
];

// Funcionalidades da Area do Cliente
const FUNCIONALIDADES = [
  {
    nome: "Diario de Obra",
    icon: Camera,
    cor: WG_COLORS.arquitetura,
    descricao: "Fotos do progresso em tempo real"
  },
  {
    nome: "Documentos",
    icon: FileText,
    cor: WG_COLORS.engenharia,
    descricao: "Contratos, projetos e arquivos"
  },
  {
    nome: "Cronograma",
    icon: Calendar,
    cor: WG_COLORS.marcenaria,
    descricao: "Etapas e prazos do projeto"
  },
  {
    nome: "Financeiro",
    icon: DollarSign,
    cor: WG_COLORS.laranja,
    descricao: "Pagamentos e faturamento"
  },
];

const FUNCIONALIDADES_EXTRA = [
  {
    nome: "Etapas do Projeto",
    icon: CheckCircle,
    cor: WG_COLORS.arquitetura,
    descricao: "Acompanhe cada fase"
  },
  {
    nome: "Garantia",
    icon: Shield,
    cor: WG_COLORS.engenharia,
    descricao: "Termos e certificados"
  },
  {
    nome: "Assistencia Tecnica",
    icon: Headphones,
    cor: WG_COLORS.marcenaria,
    descricao: "Suporte pos-entrega"
  },
  {
    nome: "Arquivos do Drive",
    icon: FolderOpen,
    cor: WG_COLORS.laranja,
    descricao: "Todos os seus documentos"
  },
];

// Componente de particulas flutuantes
function FloatingParticles() {
  const particles = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      size: Math.random() * 16 + 8,
      color: BRAND_COLORS[i % BRAND_COLORS.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 4,
      xOffset: Math.random() * 40 - 20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: 0.4,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  onComplete: () => void;
  clienteNome?: string;
  duration?: number;
}

export default function IntroAreaCliente({
  onComplete,
  clienteNome = "Cliente",
  duration = 18,
}: Props) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentPhase, setCurrentPhase] = useState<"logo" | "bemvindo" | "funcionalidades" | "extras" | "cta">("logo");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const primeiroNome = clienteNome.split(" ")[0];

  // Detectar orientacao/tamanho da tela
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768 || window.innerHeight > window.innerWidth);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Selecionar video baseado na orientacao
  const videoSrc = isMobile
    ? "/videos/hero/VERTICAL.mp4"
    : "/videos/hero/HORIZONTAL.mp4";

  // Forcar play do video quando montar
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const timeout = setTimeout(() => {
        video.play().catch(() => {
          console.log("Autoplay bloqueado, aguardando interacao...");
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [videoSrc]);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onComplete]);

  // Controle de fases baseado no tempo
  useEffect(() => {
    const elapsed = duration - timeRemaining;

    if (elapsed < 2) {
      setCurrentPhase("logo");
    } else if (elapsed < 5) {
      setCurrentPhase("bemvindo");
    } else if (elapsed < 10) {
      setCurrentPhase("funcionalidades");
    } else if (elapsed < 14) {
      setCurrentPhase("extras");
    } else {
      setCurrentPhase("cta");
    }
  }, [timeRemaining, duration]);

  // Pular introducao
  const handleSkip = () => {
    onComplete();
  };

  // Progress bar percentage
  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Video de Fundo */}
      <video
        ref={videoRef}
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.6 }}
        onPlay={() => setIsPlaying(true)}
        onCanPlay={(e) => {
          const video = e.target as HTMLVideoElement;
          video.play().catch((e) => console.debug("Autoplay bloqueado:", e.message));
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Overlay Gradiente */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)`
        }}
      />

      {/* Particulas Flutuantes */}
      <FloatingParticles />

      {/* Gradientes de cor animados */}
      <motion.div
        className="absolute inset-0 z-[2] opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 15% 25%, ${WG_COLORS.laranja}30 0%, transparent 35%),
                       radial-gradient(circle at 85% 20%, ${WG_COLORS.arquitetura}25 0%, transparent 35%),
                       radial-gradient(circle at 75% 75%, ${WG_COLORS.engenharia}20 0%, transparent 35%),
                       radial-gradient(circle at 25% 80%, ${WG_COLORS.marcenaria}20 0%, transparent 35%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Conteudo Animado */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {/* Fase 1: Logo */}
          {currentPhase === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div
                className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden p-3"
                style={{
                  background: WG_COLORS.branco,
                  boxShadow: `0 20px 60px ${WG_COLORS.laranja}40`,
                  border: `3px solid ${WG_COLORS.laranja}30`,
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src="/imagens/logogrupoWgAlmeida.png"
                  alt="Grupo WG Almeida"
                  className="w-full h-full object-contain"
                />
                {/* Brilho animado */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
                  }}
                  animate={{
                    x: ["-150%", "150%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/90 text-xl md:text-2xl tracking-widest uppercase font-light"
              >
                Area do Cliente
              </motion.p>
            </motion.div>
          )}

          {/* Fase 2: Bem-vindo */}
          {currentPhase === "bemvindo" && (
            <motion.div
              key="bemvindo"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl"
            >
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block"
                >
                  Ola,{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block"
                  style={{ color: WG_COLORS.laranja }}
                >
                  {primeiroNome}!
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/80 text-lg md:text-xl"
              >
                Bem-vindo(a) a sua area exclusiva WG Almeida
              </motion.p>
              {/* Linha decorativa */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-32 h-1.5 mx-auto rounded-full mt-6"
                style={{
                  background: `linear-gradient(90deg, ${WG_COLORS.laranja}, ${WG_COLORS.arquitetura}, ${WG_COLORS.engenharia})`,
                }}
              />
            </motion.div>
          )}

          {/* Fase 3: Funcionalidades Principais */}
          {currentPhase === "funcionalidades" && (
            <motion.div
              key="funcionalidades"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full max-w-3xl px-4"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-semibold text-white mb-8"
              >
                O que voce encontrara aqui:
              </motion.h2>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {FUNCIONALIDADES.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.nome}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="p-4 md:p-5 rounded-xl backdrop-blur-md relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${item.cor}50, ${item.cor}25)`,
                        border: `1px solid ${item.cor}70`,
                        boxShadow: `0 10px 30px ${item.cor}30`,
                      }}
                    >
                      {/* Efeito de brilho */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                        }}
                        animate={{
                          x: ["-200%", "200%"],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          delay: index * 0.5,
                        }}
                      />
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white mb-2 mx-auto relative z-10" />
                      <h3
                        className="text-sm md:text-lg font-bold mb-1 relative z-10"
                        style={{ color: WG_COLORS.branco }}
                      >
                        {item.nome}
                      </h3>
                      <p className="text-white/80 text-xs md:text-sm relative z-10">{item.descricao}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Fase 4: Funcionalidades Extras */}
          {currentPhase === "extras" && (
            <motion.div
              key="extras"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full max-w-3xl px-4"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-semibold text-white mb-8"
              >
                E muito mais:
              </motion.h2>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {FUNCIONALIDADES_EXTRA.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.nome}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.15 }}
                      className="p-4 md:p-5 rounded-xl backdrop-blur-md relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${item.cor}40, ${item.cor}20)`,
                        border: `1px solid ${item.cor}50`,
                        boxShadow: `0 8px 25px ${item.cor}25`,
                      }}
                    >
                      <Icon className="w-7 h-7 md:w-9 md:h-9 text-white mb-2 mx-auto" />
                      <h3 className="text-sm md:text-base font-bold text-white mb-1">
                        {item.nome}
                      </h3>
                      <p className="text-white/70 text-xs">{item.descricao}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Fase 5: CTA */}
          {currentPhase === "cta" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="mb-6"
              >
                {/* Logo com circulo colorido rotativo */}
                <div className="w-24 h-24 mx-auto relative mb-4">
                  <motion.div
                    className="absolute inset-0 rounded-full p-1"
                    style={{
                      background: `conic-gradient(from 0deg,
                        ${WG_COLORS.laranja},
                        ${WG_COLORS.arquitetura},
                        ${WG_COLORS.engenharia},
                        ${WG_COLORS.marcenaria},
                        ${WG_COLORS.laranja})`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center p-3"
                      style={{ background: WG_COLORS.branco }}
                    >
                      <img
                        src="/imagens/logogrupoWgAlmeida.png"
                        alt="WG"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-4xl font-bold text-white mb-4"
              >
                Tudo pronto,{" "}
                <span style={{ color: WG_COLORS.laranja }}>{primeiroNome}</span>!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/70 text-base md:text-lg mb-8"
              >
                Confirme seus dados para acessar sua area exclusiva
              </motion.p>
              {/* Barra de progresso */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="max-w-xs mx-auto"
              >
                <div
                  className="w-full h-2 rounded-full overflow-hidden mb-2"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${WG_COLORS.laranja}, ${WG_COLORS.arquitetura}, ${WG_COLORS.engenharia})`,
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 3,
                      ease: "linear",
                    }}
                  />
                </div>
                <p className="text-white/60 text-sm">Abrindo login em {timeRemaining}s...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de Progresso Principal */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <motion.div
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${WG_COLORS.laranja}, ${WG_COLORS.arquitetura})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Controles */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 z-30">
        <motion.button
          onClick={handleSkip}
          className="flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md text-white font-medium transition-all"
          style={{
            background: `linear-gradient(135deg, ${WG_COLORS.laranja}90, ${WG_COLORS.laranja}70)`,
            border: `1px solid ${WG_COLORS.laranja}`,
            boxShadow: `0 4px 20px ${WG_COLORS.laranja}40`,
          }}
          whileHover={{ scale: 1.05, boxShadow: `0 6px 30px ${WG_COLORS.laranja}60` }}
          whileTap={{ scale: 0.95 }}
        >
          Pular
          <SkipForward className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Timer */}
      <div className="absolute top-6 right-6 z-30">
        <motion.div
          className="px-4 py-2 rounded-full backdrop-blur-md text-white/80 text-sm font-medium"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {timeRemaining}s
        </motion.div>
      </div>

      {/* Logo pequeno no canto */}
      <div className="absolute top-6 left-6 z-30">
        <motion.img
          src="/imagens/logogrupoWgAlmeida.png"
          alt="WG"
          className="h-10 opacity-70"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
