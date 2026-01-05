import json
import os
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(
    ROOT, "UsersAtendimentoDocuments01VISUALSTUDIO_OFICIALtemp_audit.json"
)
BACKUP_PATH = os.path.join(
    ROOT, "UsersAtendimentoDocuments01VISUALSTUDIO_OFICIALtemp_audit_backup.json"
)


def format_brl(value):
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def apply_corrections(data):
    """Apply automatic corrections to audit data."""
    corrections = {
        "empty_observations": 0,
        "very_small_values": 0,
        "marked_suspicious": 0,
    }

    for i, item in enumerate(data):
        valor = float(item.get("valor_total") or 0)
        obs = item.get("observacoes")

        # Fill empty observations with default
        if not obs or obs.strip() == "":
            item["observacoes"] = "[SEM_OBSERVAÇÃO] Lançamento sem descrição"
            corrections["empty_observations"] += 1

        # Mark very small values (< 1)
        if 0 < valor < 1:
            if not item["observacoes"].startswith("[AUDITORIA]"):
                item["observacoes"] = (
                    f"[AUDITORIA] Valor muito pequeno ({format_brl(valor)}). {item['observacoes']}"
                )
                corrections["very_small_values"] += 1

        # Normalize [IMPORTADO] tags
        if "[IMPORTADO]" in str(obs):
            if not obs.startswith("[IMPORTADO]"):
                item["observacoes"] = (
                    f"[IMPORTADO] {obs.replace('[IMPORTADO]', '').strip()}"
                )

        # Mark suspicious patterns
        if "nan" in str(obs).lower():
            item["observacoes"] = f"[AUDITORIA] Valor inválido (nan detectado). {obs}"
            corrections["marked_suspicious"] += 1

    return data, corrections


def main():
    print(f"Iniciando correções automáticas em {DATA_PATH}...\n")

    # Backup original
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        original_data = json.load(f)

    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(original_data, f, indent=1, ensure_ascii=False)
    print(f"✓ Backup criado: {BACKUP_PATH}\n")

    # Apply corrections
    corrected_data, stats = apply_corrections(original_data)

    # Save corrected data
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(corrected_data, f, indent=1, ensure_ascii=False)

    print("Resumo de Correções Aplicadas:")
    print(f"  • Observações vazias preenchidas: {stats['empty_observations']}")
    print(f"  • Valores pequenos marcados: {stats['very_small_values']}")
    print(f"  • Itens suspeitos marcados: {stats['marked_suspicious']}")
    print(f"\n✓ Dados corrigidos salvos em {DATA_PATH}")


if __name__ == "__main__":
    main()
