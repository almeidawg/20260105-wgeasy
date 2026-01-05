export default function ProjetosPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-light mb-4">📐 Projetos</h1>

      <p className="text-gray-600 text-base">
        Área destinada ao gerenciamento de projetos arquitetônicos, documentos,
        especificações e integração com as Obras.
      </p>

      <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border">
        <p className="text-gray-500">
          Módulo em desenvolvimento. Em breve aqui você terá:
        </p>

        <ul className="mt-3 list-disc ml-6 text-gray-600">
          <li>Cadastro de projetos</li>
          <li>Documentos anexos (PDF, DWG, imagens)</li>
          <li>Aprovação do projeto → criação automática da obra</li>
          <li>Relacionamento com cliente e especificador</li>
          <li>Status do projeto (Prévia, Executivo, Revisão, Aprovado)</li>
        </ul>
      </div>
    </div>
  );
}
