import json
import os

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(
    ROOT, "UsersAtendimentoDocuments01VISUALSTUDIO_OFICIALtemp_audit.json"
)
OUT_PATH = os.path.join(ROOT, "temp_audit_report.md")


def format_brl(value):
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def main():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_entries = len(data)
    total_sum = sum(float(x.get("valor_total") or 0) for x in data)
    observacoes_null = [x for x in data if not x.get("observacoes")]
    importados = [
        x
        for x in data
        if x.get("observacoes") and "[IMPORTADO]" in x.get("observacoes")
    ]
    zeros = [x for x in data if float(x.get("valor_total") or 0) == 0]
    smalls = [x for x in data if 0 < float(x.get("valor_total") or 0) < 1]

    top_by_value = sorted(
        data, key=lambda x: float(x.get("valor_total") or 0), reverse=True
    )[:30]

    with open(OUT_PATH, "w", encoding="utf-8") as out:
        out.write("# Relatório Temporário de Auditoria\n\n")
        out.write("**Resumo**\n\n")
        out.write(f"- **Total de lançamentos:** {total_entries}\n")
        out.write(f"- **Soma total (estimada):** {format_brl(total_sum)}\n")
        out.write(f"- **Observações vazias:** {len(observacoes_null)}\n")
        out.write(f"- **Itens marcados [IMPORTADO]:** {len(importados)}\n")
        out.write(f"- **Lançamentos com valor 0:** {len(zeros)}\n")
        out.write(f"- **Lançamentos com valor < 1:** {len(smalls)}\n\n")

        out.write("## Principais valores (top 30)\n\n")
        out.write("| # | Valor | Observações |\n")
        out.write("|---|------:|------------|\n")
        for i, item in enumerate(top_by_value, 1):
            v = float(item.get("valor_total") or 0)
            obs = item.get("observacoes") or ""
            out.write(f"| {i} | {format_brl(v)} | {obs} |\n")

        out.write("\n## Itens com observações vazias (exemplo: 50 primeiros)\n\n")
        for i, item in enumerate(observacoes_null[:50], 1):
            v = float(item.get("valor_total") or 0)
            out.write(f"- {i}. {format_brl(v)}\n")

        out.write("\n## Itens [IMPORTADO] (exemplo: 50 primeiros)\n\n")
        for i, item in enumerate(importados[:50], 1):
            v = float(item.get("valor_total") or 0)
            out.write(f'- {i}. {format_brl(v)} — {item.get("observacoes")}\n')

    print("Relatório gerado em", OUT_PATH)


if __name__ == "__main__":
    main()
