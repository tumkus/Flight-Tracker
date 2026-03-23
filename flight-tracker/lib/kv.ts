// lib/kv.ts
// Vercel KV (Upstash Redis) ile fiyat geçmişini saklar

const KV_REST_API_URL = process.env.KV_REST_API_URL!;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN!;

async function kvFetch(path: string) {
  const res = await fetch(`${KV_REST_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV error: ${res.status}`);
  return res.json();
}

async function kvPost(path: string, body: unknown) {
  const res = await fetch(`${KV_REST_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`KV error: ${res.status}`);
  return res.json();
}

export interface PriceRecord {
  price: number;
  currency: string;
  airline: string;
  checkedAt: string;
}

const HISTORY_KEY = "flight:price_history";
const LAST_PRICE_KEY = "flight:last_price";

export async function getLastPrice(): Promise<number | null> {
  try {
    const data = await kvFetch(`/get/${LAST_PRICE_KEY}`);
    return data.result ? parseFloat(data.result) : null;
  } catch {
    return null;
  }
}

export async function setLastPrice(price: number): Promise<void> {
  await kvFetch(`/set/${LAST_PRICE_KEY}/${price}`);
}

export async function appendPriceHistory(record: PriceRecord): Promise<void> {
  await kvPost(`/lpush/${HISTORY_KEY}`, [JSON.stringify(record)]);
  await kvFetch(`/ltrim/${HISTORY_KEY}/0/89`);
}

export async function getRecentHistory(days = 7): Promise<PriceRecord[]> {
  try {
    const data = await kvFetch(`/lrange/${HISTORY_KEY}/0/${days - 1}`);
    const list: string[] = data.result ?? [];
    return list.map((s) => JSON.parse(s));
  } catch {
    return [];
  }
}

export async function getWeeklyAverage(): Promise<number | null> {
  const records = await getRecentHistory(7);
  if (records.length === 0) return null;
  const sum = records.reduce((acc, r) => acc + r.price, 0);
  return Math.round(sum / records.length);
}
