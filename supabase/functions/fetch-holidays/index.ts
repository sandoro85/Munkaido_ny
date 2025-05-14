import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = 'ac5525695471fe1e87f14a823b28de9c86f3ac471919a9ad97d32b13b63de72c';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('❌ SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY hiányzik a .env fájlból');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const currentYear = new Date().getFullYear();
console.log(`📅 Ünnepnapok lekérdezése az évre: ${currentYear}`);

(async () => {
  try {
    const { data: existingHolidays, error: checkError } = await supabase
      .from('holidays')
      .select('date')
      .gte('date', `${currentYear}-01-01`)
      .lte('date', `${currentYear}-12-31`);

    if (checkError) {
      console.error('❌ Lekérdezési hiba:', checkError);
      return;
    }

    console.log("📦 Lekérdezett adatok típusa:", typeof existingHolidays);
    console.log("📦 Lekérdezett adatok:", existingHolidays);

    if (Array.isArray(existingHolidays)) {
      console.log(`📊 Ünnepnap rekordok száma: ${existingHolidays.length}`);
    } else {
      console.warn("⚠️ Nem tömb típusú adat jött vissza!");
    }

    if (Array.isArray(existingHolidays) && existingHolidays.length > 0) {
      console.log('🛑 Már léteznek ünnepnapok az adott évre, nem szükséges újra lekérni.');
      return;
    }

    // → Lekérdezés API-ról
    const apiUrl = `https://api.szunetnapok.hu/${currentYear}/?apikey=${API_KEY}`;
    console.log(`🌐 Lekérdezés API-ról: ${apiUrl}`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API válasz hiba: ${response.status} - ${await response.text()}`);
    }

    const apiData = await response.json();
    console.log(`✅ API válasz sikeres. Napok száma: ${Object.keys(apiData).length}`);

    const holidaysToInsert = Object.entries(apiData).map(([date, info]) => ({
      date,
      name: info.name || '',
      is_workday: info.isPunishmentDay || false,
    }));

    if (!holidaysToInsert.length) {
      console.log("⚠️ Az API nem adott vissza ünnepnapokat.");
      return;
    }

    const { error: insertError } = await supabase
      .from('holidays')
      .insert(holidaysToInsert);

    if (insertError) {
      console.error('❌ Hiba beszúráskor:', insertError);
      return;
    }

    console.log(`✅ Ünnepnapok sikeresen beszúrva: ${holidaysToInsert.length} db`);

  } catch (err) {
    console.error('🚨 Váratlan hiba történt:', err.message);
  }
})();
