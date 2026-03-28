import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConfig() {
    console.log('--- Testando loja_config ---')
    const { data, error } = await supabase.from('loja_config').select('*')
    if (error) {
        console.error('Erro ao ler loja_config:', error)
    } else {
        console.log('Conteúdo atual:', data)
    }
}

testConfig()
