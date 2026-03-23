// lib/serpapi.ts
// SerpApi Google Flights entegrasyonu

export interface FlightResult {
  price: number;
  currency: string;
  airline: string;
  duration: string;
  departure: string;
  arrival: string;
  stops: number;
}

export async function fetchCheapestFlight(): Promise<FlightResult | null> {
  const {
    SERPAPI_KEY,
    FLIGHT_ORIGIN,
    FLIGHT_DESTINATION,
    FLIGHT_DATE,
    FLIGHT_CURRENCY,
  } = process.env;

  if (!SERPAPI_KEY || !FLIGHT_ORIGIN || !FLIGHT_DESTINATION || !FLIGHT_DATE) {
    throw new Error("Eksik ortam değişkeni: SERPAPI_KEY, FLIGHT_ORIGIN, FLIGHT_DESTINATION, FLIGHT_DATE");
  }

  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: FLIGHT_ORIGIN,
    arrival_id: FLIGHT_DESTINATION,
    outbound_date: FLIGHT_DATE,
    currency: FLIGHT_CURRENCY ?? "TRY",
    hl: "tr",
    api_key: SERPAPI_KEY,
    type: "2", // tek yön
  });

  const url = `https://serpapi.com/search?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`SerpApi isteği başarısız: ${res.status}`);
  }

  const data = await res.json();

  // En ucuz uçuşu bul
  const allFlights = [
    ...(data.best_flights ?? []),
    ...(data.other_flights ?? []),
  ];

  if (allFlights.length === 0) return null;

  // Fiyata göre sırala
  allFlights.sort((a: { price: number }, b: { price: number }) => a.price - b.price);
  const cheapest = allFlights[0];

  const firstLeg = cheapest.flights?.[0];

  return {
    price: cheapest.price,
    currency: FLIGHT_CURRENCY ?? "TRY",
    airline: firstLeg?.airline ?? "Bilinmiyor",
    duration: `${Math.floor(cheapest.total_duration / 60)}s ${cheapest.total_duration % 60}dk`,
    departure: firstLeg?.departure_airport?.time ?? "",
    arrival: cheapest.flights?.at(-1)?.arrival_airport?.time ?? "",
    stops: (cheapest.flights?.length ?? 1) - 1,
  };
}
