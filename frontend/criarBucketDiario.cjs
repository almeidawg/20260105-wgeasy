/**
 * Cria o bucket diario-obra para fotos do diário de obra
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Criando bucket diario-obra...');

  // Listar buckets existentes
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Buckets existentes:', buckets?.map(b => b.name).join(', '));

  // Verificar se já existe
  if (buckets?.find(b => b.name === 'diario-obra')) {
    console.log('Bucket diario-obra já existe!');
    return;
  }

  // Criar bucket
  const { data, error } = await supabase.storage.createBucket('diario-obra', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  });

  if (error) {
    console.error('Erro ao criar bucket:', error.message);
    return;
  }

  console.log('Bucket criado com sucesso!', data);
}

main().catch(console.error);
