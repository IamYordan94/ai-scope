const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://iccxdalqjrivaraomcch.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljY3hkYWxxanJpdmFyYW9tY2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTIyNDAsImV4cCI6MjA4MDc4ODI0MH0.oAg9oC_QOsrP8CPDeYJomIhnO_tIijDbLMmQJQFCWoQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljY3hkYWxxanJpdmFyYW9tY2NoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjI0MCwiZXhwIjoyMDgwNzg4MjQwfQ.0CUgLLn_X7YTaRYNGnlmZjdu_HxsKGab7zkoGz3A3pQ
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✓ SUCCESS: .env.local file created!');
  console.log('Location:', envPath);
  console.log('\n⚠️  IMPORTANT: Restart your dev server now!');
  console.log('   1. Press Ctrl+C to stop the server');
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:3000/api/check-env');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}
