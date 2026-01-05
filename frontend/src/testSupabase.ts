import { supabase } from "./lib/supabaseClient";

supabase
  .from("usuarios_perfis")
  .select("*")
  .limit(1)
  .then(({ data, error }) => {
    console.log("RESULTADO SUPABASE:", { data, error });
  });
