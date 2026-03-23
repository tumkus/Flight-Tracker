// lib/checker.ts

import { fetchCheapestFlight } from "./serpapi";
import { getLastPrice, setLastPrice, appendPriceHistory, getWeeklyAverage } from "./kv";
import { sendTelegramMessage, buildDropMessage, buildNoDropMessage } from "./telegram";

export async function runPriceCheck(): Promise<{
  checked: boolean;
  newPrice: number | null;
  oldPrice: number | null;
  weeklyAvg: number | null;
  alerted: boolean;
  reason: string;
}> {
  const dropPercentThreshold = parseFloat(process.env.PRICE_DROP_PERCENT ?? "10");
  const dropAmountThreshold = parseFloat(process.env.PRICE_DROP_AMOUNT ?? "200");

  const flight = await fetchCheapestFlight();
  if (!flight) {
    return { checked: true, newPrice: null, oldPrice: null, weeklyAvg: null, alerted: false, reason: "Uçuş bulunamadı" };
  }

  const newPrice = flight.price;
  const weeklyAvg = await getWeeklyAverage();

  await appendPriceHistory({
    price: newPrice,
    currency: flight.currency,
    airline: flight.airline,
    checkedAt: new Date().toISOString(),
  });

  const oldPrice = await getLastPrice();
  await setLastPrice(newPrice);

  if (oldPrice === null) {
    return {
      checked: true, newPrice, oldPrice: null, weeklyAvg, alerted: false,
      reason: "İlk kontrol — referans fiyat kaydedildi",
    };
  }

  const dropAmount = oldPrice - newPrice;
  const dropPercent = (dropAmount / oldPrice) * 100;
  const shouldAlert = dropAmount >= dropAmountThreshold || dropPercent >= dropPercentThreshold;

  if (shouldAlert) {
    const message = buildDropMessage({
      origin: process.env.FLIGHT_ORIGIN!,
      destination: process.env.FLIGHT_DESTINATION!,
      date: process.env.FLIGHT_DATE!,
      currentPrice: newPrice,
      weeklyAvg,
      oldPrice,
      currency: flight.currency,
      airline: flight.airline,
      duration: flight.duration,
      stops: flight.stops,
      departure: flight.departure,
      arrival: flight.arrival,
      dropPercent,
      dropAmount,
    });
    await sendTelegramMessage(message);
    return {
      checked: true, newPrice, oldPrice, weeklyAvg, alerted: true,
      reason: `Bildirim gönderildi: -${dropAmount.toFixed(0)} ${flight.currency} (-%${dropPercent.toFixed(1)})`,
    };
  }

  // Fiyat düşmedi — yine de bildir
  const noDropMessage = buildNoDropMessage({
    origin: process.env.FLIGHT_ORIGIN!,
    destination: process.env.FLIGHT_DESTINATION!,
    date: process.env.FLIGHT_DATE!,
    currentPrice: newPrice,
    oldPrice,
    weeklyAvg,
    currency: flight.currency,
    airline: flight.airline,
    duration: flight.duration,
    stops: flight.stops,
  });
  await sendTelegramMessage(noDropMessage);

  return {
    checked: true, newPrice, oldPrice, weeklyAvg, alerted: false,
    reason: `Fiyat düşmedi bildirimi gönderildi (eski: ${oldPrice}, yeni: ${newPrice})`,
  };
}
