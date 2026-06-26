import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function test() {
  const adminId = 'd692ce90-9c54-41b5-ac7b-1c393205bb75';
  const salonId = 'a1310957-4b99-4df7-b852-a6a57b3064d3';
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`salon_id.eq.${salonId},id.eq.${adminId}`);
    
  console.log('Data:', data);
  if (error) console.error('Error:', error);
}

test();
