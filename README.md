# DGN Zone Daily Check-in Bot

Bot otomatis untuk claim **daily streak** DGN Points di [dgnzone.com/rewards](https://dgnzone.com/rewards).

Bot akan:
1. Mengambil status akun (`GET /api/rewards/me`)
2. Jika belum claim hari ini, langsung claim (`POST /api/rewards/daily/claim`)
3. Mengulangi siklus setiap **24 jam**

## Cara kerja autentikasi

Situs dgnzone.com tidak memakai session cookie biasa, melainkan cookie **`dgn_rewards`** (berformat JWT) yang diberikan setelah login melalui Kick. Token ini dibaca dari environment variable `DGN_COOKIE`.

## Cara mendapatkan cookie

1. Buka https://dgnzone.com/rewards di browser
2. Klik **"Log in with Kick"** dan selesaikan login
3. Buka DevTools → tab **Application** → **Cookies** → pilih `https://dgnzone.com`
4. Cari cookie bernama **`dgn_rewards`** → salin nilainya (string panjang, format JWT)

## Instalasi

```bash
npm install
```

## Konfigurasi

Buat file `.env` di root proyek:

```
DGN_COOKIE=dgn_rewards=<nilai_cookie_anda>
```

## Menjalankan

```bash
node index.js
```

Bot akan langsung melakukan siklus pertama, lalu mengulang setiap 24 jam.

## Deploy di Railway

1. Push repo ini ke GitHub
2. Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo** → pilih repo ini
3. Railway akan otomatis mendeteksi Node.js
4. Tambahkan **Environment Variable**:
   - Key: `DGN_COOKIE`
   - Value: `dgn_rewards=<nilai_cookie_anda>`
5. Atur **Start Command** ke `node index.js`
6. Deploy

Log akan menampilkan output seperti:

```
[2026-10-01T09:22:38.561Z] Bot checkin aktif. Claim langsung, lalu ulangi tiap 24 jam.
[2026-10-01T09:22:38.564Z] Ciclo checkin dimulai
[2026-10-01T09:22:40.527Z] User: username_anda | balance: 2086 | streakDay: 3 | claimedToday: false
[2026-10-01T09:22:41.000Z] CLAIM OK - dapat 400 DP, balance sekarang 2486, streakDay 4
```

## Troubleshooting

**"DGN_COOKIE tidak ditemukan"** — pastikan file `.env` ada dan berisi `DGN_COOKIE=dgn_rewards=...`

**"Log in with Kick to use DGN Rewards"** — cookie expired, ambil cookie baru dari browser dan perbarui

**"Already claimed today"** — normal, artinya streak hari ini sudah diklaim. Tunggu reset (09:00 Dublin) lalu coba lagi.

## ⚠️ Peringatan

Token GitHub yang digunakan untuk push repo ini telah terekspos di chat. Demi keamanan, **segera revoke token tersebut** di GitHub → Settings → Developer settings → Personal access tokens.