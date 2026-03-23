// lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegramMessage(text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
  });
  if (!res.ok) throw new Error(`Telegram hatası: ${await res.text()}`);
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  const monthNames = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

export function buildDropMessage(params: {
  origin: string;
  destination: string;
  date: string;
  currentPrice: number;
  weeklyAvg: number | null;
  oldPrice: number;
  currency: string;
  airline: string;
  duration: string;
  stops: number;
  departure: string;
  arrival: string;
  dropPercent: number;
  dropAmount: number;
}): string {
  const { origin, destination, date, currentPrice, weeklyAvg, oldPrice, currency, airline, duration, stops, departure, arrival, dropPercent, dropAmount } = params;
  const flag = dropPercent >= 20 ? "🔥🔥" : dropPercent >= 10 ? "🔥" : "📉";
  const stopText = stops === 0 ? "Direkt ✈️" : `${stops} aktarmalı`;

  let avgLine = "";
  if (weeklyAvg !== null) {
    const vsAvg = weeklyAvg - currentPrice;
    const vsAvgPct = ((vsAvg / weeklyAvg) * 100).toFixed(1);
    if (vsAvg > 0) {
      avgLine = `\n📊 7 günlük ort: <b>${weeklyAvg.toLocaleString("tr-TR")} ${currency}</b> → ortalamadan <b>%${vsAvgPct} daha ucuz</b>`;
    } else {
      avgLine = `\n📊 7 günlük ort: <b>${weeklyAvg.toLocaleString("tr-TR")} ${currency}</b>`;
    }
  }

  return `${flag} <b>Uçuş Fiyatı Düştü!</b>

✈️ <b>${origin} → ${destination}</b>  |  📅 ${formatDate(date)}

💰 Güncel fiyat: <b>${currentPrice.toLocaleString("tr-TR")} ${currency}</b>
<s>Önceki: ${oldPrice.toLocaleString("tr-TR")} ${currency}</s>
📉 Düşüş: <b>-${dropAmount.toLocaleString("tr-TR")} ${currency}  (-%${dropPercent.toFixed(1)})</b>${avgLine}

🛫 ${airline}  |  ${duration}  |  ${stopText}
🕐 ${departure} → ${arrival}`;
}

export function buildNoDropMessage(params: {
  origin: string;
  destination: string;
  date: string;
  currentPrice: number;
  oldPrice: number;
  weeklyAvg: number | null;
  currency: string;
  airline: string;
  duration: string;
  stops: number;
}): string {
  const { origin, destination, date, currentPrice, oldPrice, weeklyAvg, currency, airline, duration, stops } = params;
  const stopText = stops === 0 ? "Direkt ✈️" : `${stops} aktarmalı`;
  const diff = currentPrice - oldPrice;
  const diffText = diff > 0
    ? `+${diff.toLocaleString("tr-TR")} ${currency} arttı`
    : diff === 0
    ? "değişmedi"
    : `-${Math.abs(diff).toLocaleString("tr-TR")} ${currency} düştü`;

  let avgLine = "";
  if (weeklyAvg !== null) {
    avgLine = `\n📊 7 günlük ort: <b>${weeklyAvg.toLocaleString("tr-TR")} ${currency}</b>`;
  }

  return `😔 <b>Fiyat düşmedi</b>

✈️ <b>${origin} → ${destination}</b>  |  📅 ${formatDate(date)}

💰 Güncel fiyat: <b>${currentPrice.toLocaleString("tr-TR")} ${currency}</b>
Dünkü fiyat: ${oldPrice.toLocaleString("tr-TR")} ${currency} (${diffText})${avgLine}

🛫 ${airline}  |  ${duration}  |  ${stopText}`;
}
