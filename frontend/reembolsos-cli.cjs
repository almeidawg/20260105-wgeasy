// Simple CLI para listar/inserir/atualizar/deletar reembolsos.
// Uso:
//   node reembolsos-cli.cjs list
//   node reembolsos-cli.cjs insert --obra <uuid> --categoria <uuid> --valor 100 --data 2025-12-10 --status Pendente --descricao "texto"
//   node reembolsos-cli.cjs update --id <uuid> [--valor 200] [--status Pago] [--descricao "novo"]
//   node reembolsos-cli.cjs delete --id <uuid>

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://ahlqzzkxuutwoepirpzr.supabase.co";
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1];
      args[key] = val;
      i++;
    }
  }
  return args;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  try {
    if (cmd === "list") {
      const { data, error } = await supabase
        .from("reembolsos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      console.table(data || []);
      console.log(`Total: ${data?.length || 0}`);
      return;
    }

    if (cmd === "insert") {
      const payload = {
        obra_id: args.obra,
        categoria_id: args.categoria,
        valor: args.valor ? Number(args.valor) : null,
        data: args.data || null,
        status: args.status || "Pendente",
        descricao: args.descricao || null,
      };
      const { data, error } = await supabase
        .from("reembolsos")
        .insert(payload)
        .select();
      if (error) throw error;
      console.log("Inserido:", data);
      return;
    }

    if (cmd === "update") {
      if (!args.id) throw new Error("Informe --id");
      const payload = {};
      ["obra", "categoria", "valor", "data", "status", "descricao"].forEach(
        (k) => {
          if (args[k] !== undefined) {
            const keyMap = {
              obra: "obra_id",
              categoria: "categoria_id",
              valor: "valor",
              data: "data",
              status: "status",
              descricao: "descricao",
            };
            payload[keyMap[k]] = k === "valor" ? Number(args[k]) : args[k];
          }
        }
      );
      const { data, error } = await supabase
        .from("reembolsos")
        .update(payload)
        .eq("id", args.id)
        .select();
      if (error) throw error;
      console.log("Atualizado:", data);
      return;
    }

    if (cmd === "delete") {
      if (!args.id) throw new Error("Informe --id");
      const { error, count } = await supabase
        .from("reembolsos")
        .delete({ count: "exact" })
        .eq("id", args.id);
      if (error) throw error;
      console.log(`Deletados: ${count}`);
      return;
    }

    console.log(
      "Comando invalido. Use: list | insert --obra --categoria --valor --data --status --descricao | update --id ... | delete --id"
    );
  } catch (err) {
    console.error("Erro:", err.message || err);
    process.exit(1);
  }
}

main();
