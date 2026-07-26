import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iclsclkppyyzeyslkyhv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4dHNMe2gxjkDxiiWTzf1mA_MDB5bUrE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
