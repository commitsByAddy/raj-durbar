import { createClient } from '@supabase/supabase-js';
import type {Database} from "../types/database.types.tsx";


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log(supabaseUrl);
console.log(supabaseKey);

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
