// scripts/fetch-holidays.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const API_KEY = 'ac5525695471fe1e87f14a823b28de9c86f3ac471919a9ad97d32b13b63de72c';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY hiányzik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fetchHolidays(year) {
  const apiUrl = `https://api.szunetnapok.hu/${year}/?apikey=${API_KEY}`;
  console.log(`🌐 Fetching holidays from: ${apiUrl}`);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`❌ API request failed: ${response.status}`);
        const errorText = await response.text();
        console.error(`Details: ${errorText}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }

      const data = await response.json();
      const holidays = Object.entries(data).map(([date, info]) => ({
        date,
        name: info.name || '',
        is_workday: info.isPunishmentDay || false,
      }));

      console.log(`📅 ${holidays.length} holidays fetched.`);

      return holidays;
    } catch (err) {
      console.error(`❌ Error fetching holidays:`, err);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  throw new Error('🚨 Could not fetch holidays after max retries');
}

async function main() {
  const year = new Date().getFullYear();
  console.log(`🔍 Checking if holidays already exist for year ${year}...`);

  const { data: existing, error: existingError } = await supabase
    .from('holidays')
    .select('*')
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);

  if (existingError) {
    console.error('❌ Error checking existing holidays:', existingError);
  } else {
    console.log(`📄 Existing holidays found: ${existing.length}`);
  }

  if (existing && existing.length > 0) {
    console.log('ℹ️ Holidays already exist for current year, skipping insert.');
    return;
  }

  const holidaysToInsert = await fetchHolidays(year);

  const { error: insertError } = await supabase
    .from('holidays')
    .insert(holidaysToInsert);

  if (insertError) {
    console.error('❌ Error inserting holidays:', insertError);
  } else {
    console.log('✅ Holidays successfully inserted!');
  }
}

main();
