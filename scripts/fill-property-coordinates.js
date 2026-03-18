/**
 * latitude / longitude が空の物件を一括でジオコーディングして DB を更新する。
 * 使い方: node scripts/fill-property-coordinates.js
 * 前提: .env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が設定されていること。
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('.env が見つかりません。');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = (env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const anonKey = (env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !anonKey) {
  console.error('VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を .env に設定してください。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);
const geocodeUrl = `${supabaseUrl}/functions/v1/geocode`;
const DELAY_MS = 600;

async function geocode(address) {
  const res = await fetch(geocodeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ address: (address || '').trim() }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
    return { lat: data.lat, lng: data.lng };
  }
  return null;
}

async function main() {
  const { data: rows, error } = await supabase
    .from('properties')
    .select('id, address')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('properties 取得エラー:', error.message);
    process.exit(1);
  }

  const withAddress = (rows || []).filter((r) => r.address && String(r.address).trim());
  if (withAddress.length === 0) {
    console.log('緯度・経度が未設定の物件はありません（または address が空です）。');
    return;
  }

  console.log(`緯度・経度が未設定の物件: ${withAddress.length} 件。ジオコーディングを開始します。`);

  let ok = 0;
  let fail = 0;

  for (const row of withAddress) {
    const coords = await geocode(row.address);
    if (coords) {
      const { error: updateErr } = await supabase.rpc('update_property_coordinates', {
        p_property_id: row.id,
        p_lat: coords.lat,
        p_lng: coords.lng,
      });
      if (updateErr) {
        console.warn(`id=${row.id} 更新失敗:`, updateErr.message);
        fail++;
      } else {
        console.log(`id=${row.id} OK (${row.address.slice(0, 40)}...) -> ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        ok++;
      }
    } else {
      console.warn(`id=${row.id} ジオコーディング失敗: ${(row.address || '').slice(0, 50)}`);
      fail++;
    }
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`完了: 成功 ${ok} 件, 失敗 ${fail} 件`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
