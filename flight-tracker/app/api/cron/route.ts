// app/api/cron/route.ts
// Vercel Cron Job: her gün 09:00'da çalışır (vercel.json'da tanımlı)

import { NextRequest, NextResponse } from "next/server";
import { runPriceCheck } from "@/lib/checker";

export async function GET(req: NextRequest) {
  // Güvenlik: sadece Vercel veya kendi secret'ınızla çağrılabilir
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const result = await runPriceCheck();
    console.log("[Cron] Sonuç:", result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[Cron] Hata:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
