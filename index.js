const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load .env
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    }
  }
} catch (e) {
  console.error('Gagal membaca .env:', e.message);
}

const API_BASE = 'https://dgnzone.com/api/rewards';
const COOKIE = process.env.DGN_COOKIE;
const INTERVAL_MS = 24 * 60 * 60 * 1000;

if (!COOKIE) {
  console.error('DGN_COOKIE tidak ditemukan. Isi file .env dengan dgn_rewards=<value>.');
  process.exit(1);
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function getMe() {
  const res = await fetch(`${API_BASE}/me`, { headers: { Cookie: COOKIE } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function claimDaily() {
  const res = await fetch(`${API_BASE}/daily/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: COOKIE }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function cycle() {
  log('Ciclo checkin dimulai');

  let me;
  try {
    me = await getMe();
    log(`User: ${me.user.username} | balance: ${me.user.balance} | streakDay: ${me.streak.streakDay} | claimedToday: ${me.streak.claimedToday}`);
    log(`Reset berikutnya: ${me.streak.resetAt} (${me.streak.timezone})`);
  } catch (e) {
    log(`Gagal ambil status: ${e.message}`);
    return;
  }

  if (me.streak.claimedToday) {
    log('Sudah claim hari ini. Menunggu siklus berikutnya.');
    return;
  }

  try {
    const data = await claimDaily();
    log(`CLAIM OK - dapat ${data.awarded} DP, balance sekarang ${data.balance}, streakDay ${data.streak.streakDay}`);
  } catch (e) {
    log(`CLAIM GAGAL: ${e.message}`);
  }
}

log('Bot checkin aktif. Claim langsung, lalu ulangi tiap 24 jam.');
cycle();
setInterval(cycle, INTERVAL_MS);