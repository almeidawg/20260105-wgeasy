import styles from "../../planejamento/NovoPedidoPage.module.css";

export default function PlanejamentoPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className={`bg-white rounded-lg shadow-sm p-8 ${styles.inputBox}`}> {/* Usando inputBox para padronização visual */}
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className={styles.label + " mb-2"}>
            Planejamento
          </h1>
          <p className="text-gray-600 font-poppins">
            Módulo de planejamento operacional em desenvolvimento
          </p>
        </div>
      </div>
    </div>
  );
}
