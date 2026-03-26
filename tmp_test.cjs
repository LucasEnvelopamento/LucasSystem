const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envVars = fs.readFileSync('c:/Users/caio.franca/.gemini/antigravity/scratch/OsSystem/.env', 'utf-8').split('\n');
let supabaseUrl = '';
let supabaseKey = '';

envVars.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/"/g, '');
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChecklist() {
  console.log('Testing checklist insert...');
  // Tenta inserir na coluna 'quilometragem'
  const { data, error } = await supabase
    .from('checklist_avarias')
    .insert({ 
      os_id: 1, 
      pontos_avaria: [], 
      notas: 'Teste direct',
      quilometragem: '100'
    });
  
  if (error) {
    console.log('ERRO NO INSERT A:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCESSO NO INSERT A:', data);
  }

  // Tentar o Fallback B
  const { data: bData, error: bError } = await supabase
    .from('checklist_avarias')
    .insert({ 
      os_id: 1, 
      pontos_avaria: [], 
      notas: 'Teste direct sem km'
    });
  
  if (bError) {
    console.log('ERRO NO INSERT B (Fallback):', JSON.stringify(bError, null, 2));
  } else {
    console.log('SUCESSO NO INSERT B:', bData);
  }
}

testChecklist();
