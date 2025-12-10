import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('Key:', supabaseKey ? 'Found' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    // Test categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('Categories error:', catError);
    } else {
      console.log(`✓ Found ${categories?.length || 0} categories`);
    }

    // Test tools
    const { data: tools, error: toolError } = await supabase
      .from('tools')
      .select('*')
      .limit(5);
    
    if (toolError) {
      console.error('Tools error:', toolError);
    } else {
      console.log(`✓ Found ${tools?.length || 0} tools`);
      if (tools && tools.length > 0) {
        console.log('Sample tools:', tools.map(t => t.name).join(', '));
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
