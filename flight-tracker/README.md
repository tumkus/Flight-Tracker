# ✈️ Uçuş Fiyat Takipçisi

Her gün 09:00 UTC'de SerpApi'den fiyat çeker, düşüş varsa Telegram'a bildirim gönderir.

## Telegram Bildirimi Örneği

```
🔥 Uçuş Fiyatı Düştü!

✈️ IST → ANK  |  📅 15 Ağu 2025

💰 Güncel fiyat: 850 TRY
Önceki: 1.100 TRY
📉 Düşüş: -250 TRY  (-%22.7)
📊 7 günlük ort: 1.050 TRY → şu an ortalamadan %19.0 daha ucuz

🛫 Turkish Airlines  |  1s 20dk  |  Direkt ✈️
🕐 08:30 → 09:50
```

## Kurulum (5 adım)

### 1. Vercel'e Deploy Et

```bash
npm i -g vercel
vercel
```

### 2. SerpApi Hesabı

[serpapi.com](https://serpapi.com) → ücretsiz hesap → API Key al  
(100 arama/ay — günde 1 kontrol = ayda 30 arama ✅)

### 3. Telegram Bot

1. @BotFather → `/newbot` → token al
2. Bota bir mesaj gönder
3. `https://api.telegram.org/bot<TOKEN>/getUpdates` → `chat_id`'yi bul

### 4. Vercel KV (Upstash)

Vercel Dashboard → Storage → Create → KV → Projeye bağla  
(env değişkenleri otomatik eklenir)

### 5. Environment Variables

Vercel Dashboard → Settings → Environment Variables:

| Değişken | Örnek | Açıklama |
|---|---|---|
| `SERPAPI_KEY` | `abc123` | SerpApi anahtarın |
| `FLIGHT_ORIGIN` | `IST` | Kalkış IATA kodu |
| `FLIGHT_DESTINATION` | `ANK` | Varış IATA kodu |
| `FLIGHT_DATE` | `2025-08-15` | Uçuş tarihi |
| `FLIGHT_CURRENCY` | `TRY` | Para birimi |
| `PRICE_DROP_PERCENT` | `10` | Düşüş % eşiği |
| `PRICE_DROP_AMOUNT` | `200` | Düşüş TL eşiği |
| `TELEGRAM_BOT_TOKEN` | `123:ABC...` | Bot token |
| `TELEGRAM_CHAT_ID` | `123456789` | Chat ID |
| `CRON_SECRET` | `rastgele123` | Güvenlik string'i |

KV değişkenleri (KV_REST_API_URL, KV_REST_API_TOKEN) Vercel tarafından otomatik eklenir.

## Cron Zamanı Değiştirmek

`vercel.json` içindeki schedule'ı güncelle:

```json
{ "schedule": "0 9 * * *" }   ← 09:00 UTC (12:00 Türkiye)
{ "schedule": "0 6 * * *" }   ← 06:00 UTC (09:00 Türkiye)
```

## Rota Değiştirmek

Vercel → Settings → Environment Variables → `FLIGHT_ORIGIN`, `FLIGHT_DESTINATION`, `FLIGHT_DATE` güncelle → Redeploy.
