import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import emailjs from "@emailjs/browser";

interface Arquivo {
  nome: string;
  url: string;
}

interface Obra {
  id: number;
  cliente: string;
  endereco: string;
  status: string;
  previsaoEntrega: string;
}

export async function enviarEmailComPdf(
  obra: Obra,
  arquivos: Arquivo[],
  destinatario: string
) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Ficha Técnica da Obra", 14, 20);

  doc.setFontSize(12);
  doc.text(`ID: ${obra.id}`, 14, 30);
  doc.text(`Cliente: ${obra.cliente}`, 14, 37);
  doc.text(`Endereço: ${obra.endereco}`, 14, 44);
  doc.text(`Status: ${obra.status}`, 14, 51);
  doc.text(
    `Previsão de Entrega: ${new Date(obra.previsaoEntrega).toLocaleDateString("pt-BR")}`,
    14,
    58
  );

  if (arquivos.length > 0) {
    autoTable(doc, {
      startY: 70,
      head: [["Arquivo", "Link"]],
      body: arquivos.map((a) => [a.nome, a.url]),
      styles: { fontSize: 10 },
      columnStyles: { 1: { cellWidth: 100 } },
    });
  }

  const pdfBlob = doc.output("blob");

  const formData = new FormData();
  formData.append("to_email", destinatario);
  formData.append("subject", `Ficha da Obra #${obra.id}`);
  formData.append("message", "Segue em anexo a ficha técnica da obra.");
  formData.append("attachment", pdfBlob, `obra_${obra.id}_ficha.pdf`);

  try {
    const result = await emailjs.sendForm(
      "YOUR_SERVICE_ID",
      "YOUR_TEMPLATE_ID",
      // sendForm expects an HTMLFormElement or selector; cast to any to allow FormData here
      formData as unknown as any,
      "YOUR_PUBLIC_KEY"
    );

    alert("E-mail enviado com sucesso!");
    return result;
  } catch (error) {
    alert("Erro ao enviar e-mail.");
    console.error(error);
  }
}
