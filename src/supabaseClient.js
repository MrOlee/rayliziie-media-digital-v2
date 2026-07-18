import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://harpdcqmrqdgckcuhxfr.supabase.co';
const supabaseKey = 'sb_publishable_ppzSXi7DuN7v0racT9l98A_JxK5-MGG';

export const supabase = createClient(supabaseUrl, supabaseKey);
