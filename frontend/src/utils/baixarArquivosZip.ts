import JSZip from "jszip";
import { saveAs } from "file-saver";

interface Arquivo {
  nome: string;
  url: string;
}

export async function baixarArquivosZip(obraId: string, arquivos: Arquivo[]) {
  if (arquivos.length === 0) {
    alert("Nenhum arquivo disponível para download.");
    return;
  }

  const zip = new JSZip();
  const pasta = zip.folder(`obra_${obraId}`)!;

  for (const arquivo of arquivos) {
    try {
      const resposta = await fetch(arquivo.url);
      const blob = await resposta.blob();
      pasta.file(arquivo.nome, blob);
    } catch (err) {
      console.error(`Erro ao baixar ${arquivo.nome}:`, err);
    }
  }

  const conteudoZip = await zip.generateAsync({ type: "blob" });
  saveAs(conteudoZip, `obra_${obraId}_documentos.zip`);
}
