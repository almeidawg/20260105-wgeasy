import { motion } from "framer-motion";

interface Props {
  loading: boolean;
  data: any[] | null;
}

export function DashboardProjectsGrid({ loading, data }: Props) {
  if (loading) {
    return <p>Carregando…</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-[#6A6A6A]">Nenhum item no pipeline.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {data.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="p-5 bg-white border border-[#E4E4E4] rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer"
        >
          <p className="font-oswald text-lg uppercase tracking-wide text-[#2E2E2E]">
            {item.titulo}
          </p>
          <p className="text-sm text-[#6A6A6A]">{item.cliente}</p>

          <p className="text-[#2E2E2E] font-semibold mt-3">
            R$ {item.valor?.toLocaleString("pt-BR")}
          </p>

          <div className="text-xs mt-2 text-[#6A6A6A]">
            Status: {item.status}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
