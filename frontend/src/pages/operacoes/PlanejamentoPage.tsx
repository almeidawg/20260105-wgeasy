import styles from "../../planejamento/NovoPedidoPage.module.css";

export default function PlanejamentoPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className={`bg-white rounded-lg shadow-sm p-8 ${styles.inputBox}`}>
        {/* Usando inputBox para padronização visual */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="text-6xl mb-0">📋</div>
            <div className="page-header-inline text-left">
              <div className="page-header-first-line">
                <h1 className={`${styles.label} page-header-title`}>Planejamento</h1>
                <span className="page-header-line" />
              </div>
              <p className="page-header-subtitle-inline text-gray-600 font-poppins">
                Módulo de planejamento operacional em desenvolvimento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
