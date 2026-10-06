import fs from 'fs';
import net from 'net';
import https from 'https';

// Load .env
const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
}

console.log('='.repeat(65));
console.log('  SUPABASE & DATABASE NETWORK CONNECTIVITY DIAGNOSTIC');
console.log('='.repeat(65));

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || 'https://fctanziyohhansctrdvt.supabase.co';
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
const databaseUrl = env.DATABASE_URL || '';

function checkPort(host, port, timeout = 4000) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    s.setTimeout(timeout);
    s.connect(port, host, () => {
      s.destroy();
      resolve({ host, port, ok: true });
    });
    s.on('error', (err) => {
      resolve({ host, port, ok: false, error: err.code });
    });
    s.on('timeout', () => {
      s.destroy();
      resolve({ host, port, ok: false, error: 'TIMEOUT (Blocked by network firewall)' });
    });
  });
}

function checkHttps(url, key, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.get(`${url}/rest/v1/`, {
        headers: {
          'apikey': key || '',
          'Authorization': key ? `Bearer ${key}` : ''
        },
        timeout
      }, (res) => {
        resolve({ url, ok: res.statusCode === 200 || res.statusCode === 401, status: res.statusCode });
      });
      req.on('error', (e) => resolve({ url, ok: false, error: e.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, ok: false, error: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ url, ok: false, error: e.message });
    }
  });
}

async function run() {
  console.log('\n[1] Checking HTTPS Port 443 (Supabase Anon Key / REST API)...');
  console.log(`    Target: ${supabaseUrl}`);
  const httpsRes = await checkHttps(supabaseUrl, supabaseKey);
  if (httpsRes.ok) {
    if (httpsRes.status === 200) {
      console.log(`    [PASS] Port 443 HTTPS connected successfully! (Status 200 - API key valid)`);
    } else {
      console.log(`    [PASS] Port 443 HTTPS connected! (Status 401 - Endpoint reachable, needs valid anon key in .env)`);
    }
  } else {
    console.log(`    [FAIL] Could not connect to Supabase over HTTPS: ${httpsRes.error}`);
  }

  console.log('\n[2] Checking TCP Port 6543 (Supabase Connection Pooler)...');
  const poolerHost = 'aws-1-ap-northeast-2.pooler.supabase.com';
  const poolerRes = await checkPort(poolerHost, 6543);
  if (poolerRes.ok) {
    console.log(`    [PASS] Port 6543 reachable on ${poolerHost}`);
  } else {
    console.log(`    [BLOCKED] Port 6543 unreachable on ${poolerHost}: ${poolerRes.error}`);
  }

  console.log('\n[3] Checking TCP Port 5432 (Postgres Direct Connection)...');
  const directHost = 'aws-1-ap-northeast-2.pooler.supabase.com';
  const directRes = await checkPort(directHost, 5432);
  if (directRes.ok) {
    console.log(`    [PASS] Port 5432 reachable on ${directHost}`);
  } else {
    console.log(`    [BLOCKED] Port 5432 unreachable on ${directHost}: ${directRes.error}`);
  }

  console.log('\n' + '='.repeat(65));
  console.log('  DIAGNOSIS & RECOMMENDATION');
  console.log('='.repeat(65));
  if (!poolerRes.ok && !directRes.ok && httpsRes.ok) {
    console.log(`
Your public network is BLOCKING outgoing TCP connections on ports 5432 and 6543.
However, HTTPS Port 443 (Supabase API / Anon Key) is FULLY REACHABLE!

How to make your database reachable:

Option 1 (Fastest / Zero Code): Use Mobile Hotspot or Cloudflare 1.1.1.1 WARP / VPN
  - Turn on mobile hotspot from your phone or enable Cloudflare WARP.
  - This immediately unblocks ports 5432 & 6543 so Prisma can connect directly.

Option 2 (The Anon / Service Role Key Method via Port 443 HTTPS):
  - In your Supabase Dashboard (project: fctanziyohhansctrdvt):
    Go to Project Settings -> API.
  - Copy the 'anon public' key and 'service_role' key into your .env:
    NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
    SUPABASE_SERVICE_ROLE_KEY="..."
  - Use 'supabase' or 'supabaseAnonClient' from '@/lib/db' to query Supabase over HTTPS port 443.

Option 3 (Prisma over Port 443): Use Prisma Accelerate
  - Prisma Accelerate proxies all queries over HTTPS port 443:
    npx prisma generate --accelerate
    DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
`);
  } else if (poolerRes.ok || directRes.ok) {
    console.log('\nBoth direct and pooler ports are reachable on your network!');
  }
}

run();
